"""
models/response_models.py
-------------------------
Pydantic response schemas for all API endpoints.

These are the exact JSON shapes the Express.js backend will receive.
Document them carefully — they are the public contract of this service.

FRONTEND CONTRACT
-----------------
  POST /ingest   → IngestResponse       (upload flow)
  POST /analyze  → AnalyzeResponse      (analysis dashboard — summary, risk graph, reply)
  POST /chat     → ChatResponse         (chatbot flow)
  GET  /documents → DocumentListResponse (history sidebar)
  GET  /health   → { status, service }  (health check)
"""

from typing import List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Risk factor — individual rule that was triggered (for severity graph)
# ---------------------------------------------------------------------------
class RiskFactor(BaseModel):
    label: str = Field(..., description="Human-readable rule name (e.g. 'Lawsuit / litigation')")
    points: int = Field(..., description="Points contributed to severity (e.g. 40)")
    category: str = Field(
        default="general",
        description="Risk category for frontend chart grouping: 'legal_action', 'deadline', 'financial', 'ip', 'notice'"
    )


# ---------------------------------------------------------------------------
# POST /ingest  →  IngestResponse
# ---------------------------------------------------------------------------
class IngestResponse(BaseModel):
    document_id: str = Field(
        ...,
        description="Unique identifier for the ingested document.",
        example="doc_abc123",
    )
    filename: str = Field(
        ...,
        description="Original filename of the uploaded document.",
    )
    num_chunks: int = Field(
        ...,
        description="Number of text chunks the document was split into.",
    )
    message: str = Field(
        default="Document ingested successfully.",
    )


# ---------------------------------------------------------------------------
# POST /analyze  →  AnalyzeResponse
# ---------------------------------------------------------------------------
class AnalyzeResponse(BaseModel):
    document_id: str

    # --- AI-generated analysis (from Gemini) ---
    summary: str = Field(
        ...,
        description="Plain-English summary of the document in 2-3 sentences.",
    )
    explanation: str = Field(
        ...,
        description="Detailed explanation of legal obligations and implications.",
    )
    suggested_reply: str = Field(
        ...,
        description="Suggested reply or action plan for the recipient.",
    )

    # --- Severity / risk scoring (rule-based, deterministic) ---
    severity_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Rule-based severity score from 0 (low) to 100 (critical).",
    )
    risk_level: str = Field(
        ...,
        description="Human-readable risk level: 'Low', 'Moderate', or 'High'.",
        example="Moderate",
    )
    risk_factors: List[RiskFactor] = Field(
        default_factory=list,
        description=(
            "Breakdown of each risk rule that was triggered. "
            "Frontend uses this to render a severity chart/graph."
        ),
    )

    # --- Document classification ---
    document_type: str = Field(
        default="Legal Notice",
        description=(
            "Auto-detected document type: 'Legal Notice', 'Contract', "
            "'Copyright Strike', 'Cease and Desist', 'Court Summons', etc."
        ),
    )


# ---------------------------------------------------------------------------
# POST /chat  →  ChatResponse
# ---------------------------------------------------------------------------
class ChatResponse(BaseModel):
    document_id: str
    question: str
    answer: str = Field(
        ...,
        description="AI answer, grounded strictly in the retrieved document context.",
    )
    sources_used: int = Field(
        ...,
        description="Number of document chunks used as context for this answer.",
    )
    context_snippets: List[str] = Field(
        default_factory=list,
        description=(
            "The first 200 chars of each chunk that was used as context. "
            "Frontend can show these as 'source references' under the answer."
        ),
    )


# ---------------------------------------------------------------------------
# GET /documents  →  DocumentListResponse
# ---------------------------------------------------------------------------
class DocumentSummary(BaseModel):
    document_id: str
    filename: str
    num_chunks: int
    ingested_at: str = Field(..., description="ISO timestamp of when the document was ingested")
    analyzed: bool = Field(default=False, description="Whether /analyze has been called on this document")
    severity_score: Optional[int] = None
    risk_level: Optional[str] = None
    summary_preview: Optional[str] = Field(
        default=None,
        description="First 150 chars of the AI summary (if analyzed)"
    )


class DocumentListResponse(BaseModel):
    documents: List[DocumentSummary]
    total: int


# ---------------------------------------------------------------------------
# Generic error response (used for HTTP 4xx / 5xx)
# ---------------------------------------------------------------------------
class ErrorResponse(BaseModel):
    error: str
    detail: str = ""
