"""
api/routes.py
-------------
FastAPI route handlers for all three endpoints.

Each route handler:
  1. Validates the incoming request (FastAPI does this automatically via Pydantic)
  2. Calls the appropriate pipeline function
  3. Returns the structured response
  4. Handles errors with clear HTTP status codes and messages

The route handlers are intentionally thin — all business logic lives in core/.
This makes it easy to test the core logic independently of HTTP concerns.

ENDPOINTS
---------
  POST /ingest   — Upload and process a document
  POST /analyze  — Analyse a document (summary, explanation, reply, severity)
  POST /chat     — Ask a question about a document
"""

import traceback
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse

from core.rag_pipeline import run_ingest_pipeline, run_analyze_pipeline, run_chat_pipeline
from models.request_models import AnalyzeRequest, ChatRequest
from models.response_models import IngestResponse, AnalyzeResponse, ChatResponse, ErrorResponse
from utils.file_utils import generate_document_id, validate_file_extension, save_upload_file, delete_file
from logger import get_logger

logger = get_logger(__name__)

# Create a router — this is mounted in main.py
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
async def ingest_document(file: UploadFile = File(...)):
    """
    POST /ingest

    multipart/form-data:
      file: PDF or DOCX document

    Returns:
      { document_id, filename, num_chunks, message }
    """
    logger.info(f"POST /ingest — filename='{file.filename}', content_type='{file.content_type}'")

    # --- Validation ---
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    try:
        validate_file_extension(file.filename)
    except ValueError as e:
        logger.warning(f"File validation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    # --- Generate ID and save file ---
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
# GET /health  (bonus — useful for Express.js to ping the service)
# ===========================================================================

@router.get(
    "/health",
    summary="Health check",
    tags=["System"],
)
async def health_check():
    """Simple health check endpoint for the Express.js backend to monitor."""
    return {"status": "ok", "service": "rag_service"}
