"""
core/embeddings.py
------------------
Generates vector embeddings for text chunks.

Two backends are supported (switch via config.py):
  1. OpenAI text-embedding-3-small  (USE_OPENAI_EMBEDDINGS=true)
  2. SentenceTransformers all-MiniLM-L6-v2  (default, fully local, free)

WHY TWO BACKENDS?
-----------------
SentenceTransformers runs offline — great for hackathons with no API budget.
OpenAI embeddings are higher quality for production.
The abstraction is a single function: embed_texts(texts) -> np.ndarray
so the rest of the codebase never cares which backend is active.
"""

from typing import List
import numpy as np
from config import (
    USE_OPENAI_EMBEDDINGS,
    OPENAI_API_KEY,
    OPENAI_EMBEDDING_MODEL,
    SENTENCE_TRANSFORMER_MODEL,
)
from logger import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Lazy-load the embedding backend (avoids startup cost if not yet needed)
# ---------------------------------------------------------------------------
_st_model = None  # SentenceTransformer model instance (cached after first load)


def _get_sentence_transformer():
    """Load and cache the SentenceTransformer model."""
    global _st_model
    if _st_model is None:
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading SentenceTransformer model: {SENTENCE_TRANSFORMER_MODEL}")
        _st_model = SentenceTransformer(SENTENCE_TRANSFORMER_MODEL)
        logger.info("SentenceTransformer model loaded successfully")
    return _st_model


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def embed_texts(texts: List[str]) -> np.ndarray:
    """
    Generate embeddings for a list of text strings.

    This is the ONLY function the rest of the codebase calls.
    Dispatches to the correct backend transparently.

    Args:
        texts: List of text strings to embed.

    Returns:
        2-D NumPy array of shape (len(texts), embedding_dim).
        Each row is the embedding vector for the corresponding text.

    Raises:
        RuntimeError: If the embedding backend fails.
    """
    if not texts:
        logger.warning("embed_texts called with empty list — returning empty array")
        return np.array([])

    if USE_OPENAI_EMBEDDINGS:
        return _embed_with_openai(texts)
    else:
        return _embed_with_sentence_transformers(texts)


def embed_query(query: str) -> np.ndarray:
    """
    Embed a single query string for similarity search.

    Returns:
        1-D NumPy array (embedding vector).
    """
    result = embed_texts([query])
    return result[0]


# ---------------------------------------------------------------------------
# Backend implementations (private — do not call directly)
# ---------------------------------------------------------------------------

def _embed_with_sentence_transformers(texts: List[str]) -> np.ndarray:
    """
    Use SentenceTransformers to embed a list of texts.
    Runs entirely locally — no API keys required.
    """
    logger.info(f"Generating embeddings for {len(texts)} chunks via SentenceTransformers")
    model = _get_sentence_transformer()

    # encode() returns a numpy array directly
    embeddings = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
    logger.info(f"Embeddings generated — shape: {embeddings.shape}")
    return embeddings


def _embed_with_openai(texts: List[str]) -> np.ndarray:
    """
    Use OpenAI's embedding API to embed a list of texts.
    Requires OPENAI_API_KEY in the environment.
    """
    if not OPENAI_API_KEY:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. "
            "Either set the key or set USE_OPENAI_EMBEDDINGS=false to use SentenceTransformers."
        )

    import openai
    openai.api_key = OPENAI_API_KEY

    logger.info(f"Generating embeddings for {len(texts)} chunks via OpenAI ({OPENAI_EMBEDDING_MODEL})")

    response = openai.embeddings.create(
        model=OPENAI_EMBEDDING_MODEL,
        input=texts,
    )

    # Extract embedding vectors in the correct order
    embeddings = np.array([item.embedding for item in response.data])
    logger.info(f"Embeddings generated — shape: {embeddings.shape}")
    return embeddings
