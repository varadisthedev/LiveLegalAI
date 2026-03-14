"""
models/response_models.py
-------------------------
Pydantic response schemas for all API endpoints.

These are the exact JSON shapes the Express.js backend will receive.
Document them carefully — they are the public contract of this service.
"""

from pydantic import BaseModel, Field


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
    summary: str = Field(
        ...,
        description="Plain-English summary of the document.",
    )
    explanation: str = Field(
        ...,
        description="Explanation of the legal notice / key obligations.",
    )
    suggested_reply: str = Field(
        ...,
        description="Suggested reply or action for the recipient.",
    )
    severity_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Rule-based severity score from 0 (low) to 100 (critical).",
    )


# ---------------------------------------------------------------------------
# POST /chat  →  ChatResponse
# ---------------------------------------------------------------------------
class ChatResponse(BaseModel):
    document_id: str
    question: str
    answer: str = Field(
        ...,
        description="Claude's answer, grounded strictly in the retrieved document context.",
    )
    sources_used: int = Field(
        ...,
        description="Number of document chunks used as context for this answer.",
    )


# ---------------------------------------------------------------------------
# Generic error response (used for HTTP 4xx / 5xx)
# ---------------------------------------------------------------------------
class ErrorResponse(BaseModel):
    error: str
    detail: str = ""
