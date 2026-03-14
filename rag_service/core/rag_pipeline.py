"""
core/rag_pipeline.py
--------------------
The main RAG orchestration layer.

This module contains three pipeline functions — one per API endpoint.
They compose the smaller modules (parser, cleaner, chunker, embeddings,
vector store, retriever, severity scorer) into complete workflows.

DESIGN PRINCIPLE
----------------
Each pipeline function makes every step explicit.
There are no "magic chains" — you can read top-to-bottom and understand
exactly what happens at every stage. Every step is logged.

LLM BACKEND: Google Gemini (google-generativeai SDK)
  - Uses gemini-2.0-flash by default (fast, cheap, high quality)
  - Model is configurable via GEMINI_MODEL env var

PIPELINE FUNCTIONS
------------------
  run_ingest_pipeline(file_path, document_id, filename)  →  IngestResponse
  run_analyze_pipeline(document_id, query)               →  AnalyzeResponse
  run_chat_pipeline(document_id, question)               →  ChatResponse
"""

import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from config import GEMINI_API_KEY, GEMINI_MODEL
from core.document_parser import parse_document
from core.text_cleaner import clean_text
from core.chunker import split_into_chunks
from core.embeddings import embed_texts
from core.vector_store import save_index
from core.retriever import retrieve_top_chunks, format_context
from core.severity_scoring import compute_severity_score
from models.response_models import IngestResponse, AnalyzeResponse, ChatResponse
from logger import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Initialise Gemini client once at module level (not per-request).
# google-generativeai uses a global configure() call, then model instances.
# ---------------------------------------------------------------------------
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY is not set — Gemini calls will fail!")

genai.configure(api_key=GEMINI_API_KEY)

# Gemini model instance — reused across all requests
_gemini_model = genai.GenerativeModel(
    model_name=GEMINI_MODEL,
    # Safety settings use enum values — required by google-generativeai v0.8.x
    # (plain strings like 'DANGEROUS_CONTENT' cause a KeyError in this version)
    safety_settings={
        HarmCategory.HARM_CATEGORY_HARASSMENT:        HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH:       HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    },
)

logger.info(f"Gemini model initialised: {GEMINI_MODEL}")


def _call_gemini(system_prompt: str, user_prompt: str, max_tokens: int = 1500) -> str:
    """
    Send a prompt to Gemini and return the text response.

    Gemini's SDK combines system + user prompts differently from Claude:
      - We prefix the system instructions into the user message since
        GenerativeModel.generate_content() takes a single prompt string.
      - Alternatively we use system_instruction= (supported in Gemini 1.5+).

    Args:
        system_prompt : Instructions for how Gemini should behave.
        user_prompt   : The actual request / question with document context.
        max_tokens    : Maximum output token budget.

    Returns:
        The generated text string.

    Raises:
        RuntimeError: If Gemini returns no content.
    """
    response = _gemini_model.generate_content(
        # Combine system + user into one prompt (cleanest cross-version approach)
        f"{system_prompt}\n\n{user_prompt}",
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=0.3,   # Low temperature for factual legal responses
        ),
    )

    # Gemini response structure: response.text (shortcut) or response.candidates[0]
    if not response.candidates:
        raise RuntimeError(
            "Gemini returned no candidates. The prompt may have been blocked by safety filters."
        )

    text = response.text
    if not text:
        raise RuntimeError("Gemini returned an empty response text.")

    return text


# ===========================================================================
# PIPELINE 1: /ingest
# ===========================================================================

def run_ingest_pipeline(file_path: str, document_id: str, filename: str) -> IngestResponse:
    """
    Full ingestion pipeline for a single document.

    Steps (each logged explicitly):
      1. Parse document text from PDF or DOCX
      2. Clean the raw text
      3. Chunk the text into overlapping segments
      4. Generate embeddings for all chunks
      5. Build and persist a FAISS index

    Note: Ingest does NOT call Gemini — it is pure local processing.

    Args:
        file_path   : Absolute path to the uploaded file on disk.
        document_id : Unique identifier (generated by the route handler).
        filename    : Original filename (for the response payload).

    Returns:
        IngestResponse with document_id and chunk count.
    """
    logger.info(f"===== INGEST PIPELINE START | document_id={document_id} | file={filename} =====")

    # Step 1: Parse document
    logger.info("Step 1/5 — Parsing document")
    raw_text = parse_document(file_path)

    # Step 2: Clean text
    logger.info("Step 2/5 — Cleaning text")
    clean = clean_text(raw_text)

    # Step 3: Chunk text
    logger.info("Step 3/5 — Chunking text")
    chunks = split_into_chunks(clean)

    if not chunks:
        raise ValueError("Document produced zero chunks after parsing and cleaning.")

    # Step 4: Generate embeddings
    logger.info("Step 4/5 — Generating embeddings")
    embeddings = embed_texts(chunks)

    # Step 5: Store in FAISS
    logger.info("Step 5/5 — Storing embeddings in FAISS vector store")
    save_index(document_id, embeddings, chunks)

    logger.info(f"===== INGEST PIPELINE COMPLETE | {len(chunks)} chunks stored =====")

    return IngestResponse(
        document_id=document_id,
        filename=filename,
        num_chunks=len(chunks),
        message="Document ingested successfully.",
    )


# ===========================================================================
# PIPELINE 2: /analyze
# ===========================================================================

def run_analyze_pipeline(document_id: str, query: str) -> AnalyzeResponse:
    """
    Analysis pipeline — produces summary, explanation, suggested reply, and severity score.

    Steps:
      1. Retrieve relevant chunks from FAISS
      2. Compute severity score from chunk text
      3. Build a structured prompt for Gemini
      4. Call Gemini to get summary / explanation / suggested_reply
      5. Return structured AnalyzeResponse

    Args:
        document_id : The document to analyze (must have been ingested first).
        query       : Optional focus query for retrieval.

    Returns:
        AnalyzeResponse with all four analysis fields.
    """
    logger.info(f"===== ANALYZE PIPELINE START | document_id={document_id} =====")

    # Step 1: Retrieve relevant chunks
    logger.info("Step 1/3 — Retrieving relevant document chunks")
    chunks = retrieve_top_chunks(document_id, query)
    context = format_context(chunks)

    # Step 2: Compute severity score
    logger.info("Step 2/3 — Computing severity score")
    combined_text = "\n".join(chunks)
    severity_score, triggered_rules = compute_severity_score(combined_text)
    severity_explanation = (
        f"Severity: {severity_score}/100. "
        + (f"Risk factors detected: {', '.join(triggered_rules)}." if triggered_rules else "No major risk factors detected.")
    )

    # Step 3: Call Gemini for structured analysis
    logger.info("Step 3/3 — Sending context to Gemini for analysis")

    system_prompt = (
        "You are a legal assistant helping ordinary people understand legal documents.\n"
        "Your job is to explain legal documents in simple, plain English.\n"
        "CRITICAL RULES:\n"
        "  - NEVER invent legal facts or make up details not present in the document.\n"
        "  - ONLY use information from the provided document excerpts.\n"
        "  - If the document does not contain enough information to answer, say so clearly.\n"
        "  - Always be concise, clear, and empathetic to someone who may be stressed about a legal notice.\n"
    )

    user_prompt = f"""You have been given excerpts from a legal document.
Please provide a structured analysis with EXACTLY these three sections, clearly labeled:

SUMMARY:
Write a 2-3 sentence plain-English summary of what this document is about and what it requires of the recipient.

EXPLANATION:
Explain the key legal obligations, rights, and implications for the recipient. Use simple language. No legal jargon.

SUGGESTED REPLY:
Provide a practical suggested action or draft reply the recipient could take. Be specific.

--- DOCUMENT EXCERPTS ---
{context}
--- END OF DOCUMENT EXCERPTS ---

Additional context: {severity_explanation}
"""

    full_response = _call_gemini(system_prompt, user_prompt, max_tokens=1500)
    logger.debug(f"Gemini raw response length: {len(full_response)} characters")

    # Parse the three sections from Gemini's structured response
    summary, explanation, suggested_reply = _parse_analyze_response(full_response)

    logger.info(f"===== ANALYZE PIPELINE COMPLETE | severity_score={severity_score} =====")

    return AnalyzeResponse(
        document_id=document_id,
        summary=summary,
        explanation=explanation,
        suggested_reply=suggested_reply,
        severity_score=severity_score,
    )


def _parse_analyze_response(text: str) -> tuple:
    """
    Parse Gemini's three-section analysis response.

    Looks for SUMMARY:, EXPLANATION:, and SUGGESTED REPLY: labels.
    Falls back gracefully if the model doesn't follow the exact format.

    Returns:
        (summary, explanation, suggested_reply) as strings.
    """
    import re

    def extract_section(label: str, next_labels: list, full_text: str) -> str:
        others = "|".join(re.escape(l) for l in next_labels)
        pattern = rf"{re.escape(label)}:\s*(.*?)(?=(?:{others}):|$)"
        match = re.search(pattern, full_text, flags=re.IGNORECASE | re.DOTALL)
        if match:
            return match.group(1).strip()
        return ""

    summary        = extract_section("SUMMARY",        ["EXPLANATION", "SUGGESTED REPLY"], text)
    explanation    = extract_section("EXPLANATION",    ["SUMMARY",     "SUGGESTED REPLY"], text)
    suggested_reply = extract_section("SUGGESTED REPLY", ["SUMMARY",   "EXPLANATION"],     text)

    if not summary and not explanation and not suggested_reply:
        logger.warning("Could not parse structured sections from Gemini response — returning raw text as summary")
        return text, "See summary above.", "Please consult a qualified legal professional."

    return (
        summary         or "Summary not available.",
        explanation     or "Explanation not available.",
        suggested_reply or "Please consult a qualified legal professional.",
    )


# ===========================================================================
# PIPELINE 3: /chat
# ===========================================================================

def run_chat_pipeline(document_id: str, question: str) -> ChatResponse:
    """
    Chat pipeline — answers a specific user question about a document.

    Steps:
      1. Retrieve the top-K relevant chunks for the question
      2. Build a grounded prompt with the retrieved context
      3. Send to Gemini with strict instructions to stay within the document
      4. Return the answer

    Args:
        document_id : The document to query.
        question    : The user's natural-language question.

    Returns:
        ChatResponse with the answer and metadata.
    """
    logger.info(f"===== CHAT PIPELINE START | document_id={document_id} =====")
    logger.info(f"Question: '{question}'")

    # Step 1: Retrieve relevant chunks
    logger.info("Step 1/2 — Retrieving relevant document chunks")
    chunks = retrieve_top_chunks(document_id, question)
    context = format_context(chunks)

    # Step 2: Build and send Gemini prompt
    logger.info("Step 2/2 — Sending context + question to Gemini")

    system_prompt = (
        "You are a legal document assistant.\n"
        "Your job is to answer questions about a specific legal document.\n"
        "CRITICAL RULES:\n"
        "  - ONLY answer based on the document excerpts provided to you.\n"
        "  - If the answer is not in the provided excerpts, say: "
        "'I cannot find this information in the provided document sections.'\n"
        "  - NEVER make up legal facts, dates, amounts, or names.\n"
        "  - Keep answers concise and in plain English.\n"
    )

    user_prompt = f"""Please answer the following question based ONLY on the document excerpts below.

QUESTION: {question}

--- DOCUMENT EXCERPTS ---
{context}
--- END OF DOCUMENT EXCERPTS ---

Answer the question concisely and clearly. If the information is not present in the excerpts, say so.
"""

    answer = _call_gemini(system_prompt, user_prompt, max_tokens=800)
    answer = answer.strip()

    logger.info(f"Gemini answer generated — {len(answer)} characters")
    logger.info(f"===== CHAT PIPELINE COMPLETE =====")

    return ChatResponse(
        document_id=document_id,
        question=question,
        answer=answer,
        sources_used=len(chunks),
    )
