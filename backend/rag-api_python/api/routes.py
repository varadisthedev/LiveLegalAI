"""
ENDPOINTS
---------
  POST /ingest   — Upload and process a document
  POST /analyze  — Analyse a document (summary, explanation, reply, severity)
  POST /chat     — Ask a question about a document
"""

import os
import time
import traceback
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse

from core.rag_pipeline import run_ingest_pipeline, run_analyze_pipeline, run_chat_pipeline
from models.request_models import AnalyzeRequest, ChatRequest
from models.response_models import IngestResponse, AnalyzeResponse, ChatResponse, ErrorResponse
from utils.file_utils import generate_document_id, validate_file_extension, validate_document_id, save_upload_file, delete_file
from config import (
    APP_VERSION,
    FAISS_INDEX_DIR,
    UPLOAD_DIR,
    ANTHROPIC_API_KEY,
    OPENAI_API_KEY,
    GEMINI_API_KEY,
    USE_OPENAI_EMBEDDINGS,
)
from logger import get_logger

_START_TIME = time.time()

logger = get_logger(__name__)
router = APIRouter()

# ===========================================================================
# POST /ingest
# ===========================================================================

@router.post(
    "/ingest",
    response_model=IngestResponse,
    summary="Upload and ingest a legal document",
    description=(
        "Accepts a PDF or DOCX file. "
        "Extracts text, cleans it, chunks it, generates embeddings, "
        "and stores them in a FAISS vector index. "
        "Returns a document_id for use with /analyze and /chat."
    ),
    tags=["Documents"],
)
async def ingest_document(
    file: UploadFile = File(...),
    document_id: str = Form(None)
):
    """
    POST /ingest

    multipart/form-data:
      file: PDF or DOCX document
      document_id?: string (optional custom document ID)

    Returns:
      { document_id, filename, num_chunks, message }
    """
    logger.info(f"POST /ingest — filename='{file.filename}', content_type='{file.content_type}', document_id='{document_id}'")

    # --- Validation ---
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    try:
        validate_file_extension(file.filename)
    except ValueError as e:
        logger.warning(f"File validation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    # --- Generate or validate the document ID ---
    # A client-supplied document_id is forwarded straight into filesystem
    # paths (save_upload_file, vector_store's FAISS files), so it must be
    # constrained to a safe charset before use — otherwise a value like
    # "../../etc/whatever" would escape UPLOAD_DIR/FAISS_INDEX_DIR.
    if document_id and document_id.strip():
        document_id = document_id.strip()
        try:
            validate_document_id(document_id)
        except ValueError as e:
            logger.warning(f"Rejected invalid document_id from client: {e}")
            raise HTTPException(status_code=400, detail=str(e))
    else:
        document_id = generate_document_id()
    saved_path = None

    try:
        saved_path = await save_upload_file(file, document_id)

        # --- Run the ingestion pipeline ---
        result = run_ingest_pipeline(
            file_path=saved_path,
            document_id=document_id,
            filename=file.filename,
        )
        return result

    except ValueError as e:
        # User-facing errors (bad file content, zero chunks, etc.)
        logger.error(f"Ingest validation error: {e}")
        raise HTTPException(status_code=422, detail=str(e))

    except Exception as e:
        # Unexpected errors — log full traceback for debugging
        logger.error(f"Ingest pipeline error: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error during ingestion: {str(e)}")

    finally:
        # Always clean up the temporary file from disk
        if saved_path:
            delete_file(saved_path)


# ===========================================================================
# POST /analyze
# ===========================================================================

@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Analyze a legal document",
    description=(
        "Retrieves relevant chunks from an ingested document, "
        "generates a plain-English summary, explanation, suggested reply, "
        "and a severity score (0-100)."
    ),
    tags=["Analysis"],
)
async def analyze_document(request: AnalyzeRequest):
    """
    POST /analyze

    JSON body:
      { document_id: string, query?: string }

    Returns:
      { document_id, summary, explanation, suggested_reply, severity_score }
    """
    logger.info(f"POST /analyze — document_id='{request.document_id}'")

    try:
        result = run_analyze_pipeline(
            document_id=request.document_id,
            query=request.query,
        )
        return result

    except FileNotFoundError as e:
        # Document not ingested yet
        logger.warning(f"Document not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        logger.error(f"Analyze pipeline error: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error during analysis: {str(e)}")


# ===========================================================================
# POST /chat
# ===========================================================================

@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat with a legal document",
    description=(
        "Ask any natural-language question about an ingested document. "
        "The answer is grounded strictly in the retrieved document context."
    ),
    tags=["Chat"],
)
async def chat_with_document(request: ChatRequest):
    """
    POST /chat

    JSON body:
      { document_id: string, question: string }

    Returns:
      { document_id, question, answer, sources_used }
    """
    logger.info(f"POST /chat — document_id='{request.document_id}', question='{request.question[:80]}'")

    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        result = run_chat_pipeline(
            document_id=request.document_id,
            question=request.question,
        )
        return result

    except FileNotFoundError as e:
        logger.warning(f"Document not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        logger.error(f"Chat pipeline error: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error during chat: {str(e)}")


# ===========================================================================
# GET /health  —  liveness + dependency check, used by Docker/Express/Caddy
# ===========================================================================

def _check_dir_writable(path: str) -> str:
    """Best-effort check that a storage directory exists and is writable."""
    try:
        os.makedirs(path, exist_ok=True)
        probe = os.path.join(path, ".health_check_tmp")
        with open(probe, "w") as f:
            f.write("ok")
        os.remove(probe)
        return "ok"
    except Exception as e:
        return f"error: {e}"


@router.get(
    "/health",
    summary="Health check",
    description=(
        "Reports service liveness plus the health of everything /ingest, /analyze, "
        "and /chat actually depend on: writable storage and at least one configured "
        "LLM provider. Returns HTTP 503 (instead of 200) when a hard dependency is "
        "down, so container orchestrators and load balancers can detect and act on it."
    ),
    tags=["System"],
)
async def health_check():
    from core.document_registry import get_all_documents

    checks = {}
    healthy = True

    # --- Storage: /ingest, /analyze, /chat all read/write here ---
    for name, path in (("faiss_index_dir", FAISS_INDEX_DIR), ("upload_dir", UPLOAD_DIR)):
        result = _check_dir_writable(path)
        checks[name] = result
        if result != "ok":
            healthy = False

    # --- LLM providers: call_llm() needs at least one configured to ever succeed ---
    providers = {
        "claude": bool(ANTHROPIC_API_KEY),
        "openai": bool(OPENAI_API_KEY),
        "gemini": bool(GEMINI_API_KEY),
    }
    checks["llm_providers"] = providers
    if not any(providers.values()):
        checks["llm_providers_error"] = "No LLM provider is configured — /analyze and /chat will always fail."
        healthy = False

    # --- Embeddings config consistency ---
    if USE_OPENAI_EMBEDDINGS and not OPENAI_API_KEY:
        checks["embedding_backend"] = "error: USE_OPENAI_EMBEDDINGS=true but OPENAI_API_KEY is missing"
        healthy = False
    else:
        checks["embedding_backend"] = "openai" if USE_OPENAI_EMBEDDINGS else "sentence-transformers (local)"

    # --- Cheap informational stats (registry is an in-memory dict, no I/O cost) ---
    try:
        checks["documents_indexed"] = len(get_all_documents())
    except Exception as e:
        checks["documents_indexed"] = f"error: {e}"

    body = {
        "status": "healthy" if healthy else "unhealthy",
        "service": "rag_service",
        "version": APP_VERSION,
        "uptime_seconds": round(time.time() - _START_TIME, 1),
        "checks": checks,
    }
    return JSONResponse(status_code=200 if healthy else 503, content=body)


# ===========================================================================
# GET /documents  —  List all ingested documents (for history sidebar)
# ===========================================================================

@router.get(
    "/documents",
    summary="List all ingested documents",
    description=(
        "Returns a list of all documents that have been ingested. "
        "Includes analysis status, severity score, and summary preview."
    ),
    tags=["Documents"],
)
async def list_documents():
    """
    GET /documents

    Returns:
      { documents: [...], total: int }
    """
    from core.document_registry import get_all_documents
    from models.response_models import DocumentListResponse, DocumentSummary

    docs = get_all_documents()
    doc_summaries = [DocumentSummary(**d) for d in docs]
    return DocumentListResponse(documents=doc_summaries, total=len(doc_summaries))


# ===========================================================================
# GET /documents/{document_id}  —  Get single document info
# ===========================================================================

@router.get(
    "/documents/{document_id}",
    summary="Get a single document's metadata",
    tags=["Documents"],
)
async def get_document_info(document_id: str):
    """
    GET /documents/{document_id}

    Returns document metadata including analysis status.
    """
    from core.document_registry import get_document

    doc = get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")
    return doc

