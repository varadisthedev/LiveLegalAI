"""
config.py
---------
Central configuration for the RAG microservice.
All environment variables and tuneable constants live here.
Never scatter constants across files — always import from this module.
"""

import os
from dotenv import load_dotenv

# Load .env file if present (useful for local development)
load_dotenv()


# ---------------------------------------------------------------------------
# Anthropic Claude
# ---------------------------------------------------------------------------
ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20241022")

# ---------------------------------------------------------------------------
# Google Gemini
# ---------------------------------------------------------------------------
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
# Note: Using gemini-2.5-flash (or gemini-2.0-flash-lite-preview-02-05) based on your API key
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# ---------------------------------------------------------------------------
# OpenAI (used for embeddings if USE_OPENAI_EMBEDDINGS=true)
# ---------------------------------------------------------------------------
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
USE_OPENAI_EMBEDDINGS: bool = os.getenv("USE_OPENAI_EMBEDDINGS", "false").lower() == "true"
OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"

# ---------------------------------------------------------------------------
# SentenceTransformers (fallback when OpenAI embeddings are disabled)
# ---------------------------------------------------------------------------
SENTENCE_TRANSFORMER_MODEL: str = os.getenv(
    "SENTENCE_TRANSFORMER_MODEL", "all-MiniLM-L6-v2"
)

# ---------------------------------------------------------------------------
# FAISS / Vector store
# ---------------------------------------------------------------------------
# Directory where FAISS index files are persisted on disk.
FAISS_INDEX_DIR: str = os.getenv("FAISS_INDEX_DIR", "./faiss_indexes")

# ---------------------------------------------------------------------------
# Document chunking
# ---------------------------------------------------------------------------
CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "500"))       # tokens / characters per chunk
CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "50"))  # overlap between consecutive chunks

# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------
TOP_K_CHUNKS: int = int(os.getenv("TOP_K_CHUNKS", "5"))     # number of chunks to retrieve

# ---------------------------------------------------------------------------
# File upload
# ---------------------------------------------------------------------------
UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploaded_files")
ALLOWED_EXTENSIONS: set = {"pdf", "docx"}
MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "20"))

# ---------------------------------------------------------------------------
# App metadata
# ---------------------------------------------------------------------------
APP_TITLE: str = "LiveLegal AI — RAG Microservice"
APP_VERSION: str = "1.0.0"
APP_DESCRIPTION: str = (
    "RAG-powered legal document analysis microservice. "
    "Ingests PDFs/DOCX, answers questions, and scores severity."
)
