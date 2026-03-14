"""
models/request_models.py
------------------------
Pydantic request schemas for all API endpoints.

Keeping request and response models separate makes it easy to version
the API later without touching business logic.
"""

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# POST /analyze
# ---------------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    document_id: str = Field(
        ...,
        description="The document_id returned by the /ingest endpoint.",
        example="doc_abc123",
    )
    query: str = Field(
        default="Summarise this legal document and explain the key obligations.",
        description="Optional natural-language query to focus the analysis.",
    )


# ---------------------------------------------------------------------------
# POST /chat
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    document_id: str = Field(
        ...,
        description="The document_id returned by the /ingest endpoint.",
        example="doc_abc123",
    )
    question: str = Field(
        ...,
        description="The user's question about the document.",
        example="What is the deadline mentioned in this notice?",
    )
