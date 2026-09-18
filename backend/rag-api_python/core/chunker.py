"""
core/chunker.py
---------------
Splits cleaned document text into overlapping chunks.

WHY CHUNKING MATTERS
--------------------
Embedding models have a fixed token limit (e.g. 512 for MiniLM).
FAISS retrieval works best on focused, paragraph-sized pieces.
Overlap ensures that sentences spanning chunk boundaries are not lost.

STRATEGY
--------
Character-based sliding window (no hidden tokeniser magic).
  - chunk_size   : target size of each chunk in characters
  - chunk_overlap: number of characters shared between adjacent chunks

For legal documents, 500-char chunks with 50-char overlap
is a solid starting point. Tune via config.py.
"""

from typing import List
from config import CHUNK_SIZE, CHUNK_OVERLAP
from logger import get_logger

logger = get_logger(__name__)


def split_into_chunks(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP,
) -> List[str]:
    """
    Split text into overlapping chunks of approximately `chunk_size` characters.

    Algorithm:
      1. Start at position 0.
      2. Take a slice of `chunk_size` characters.
      3. Move the cursor forward by (chunk_size - chunk_overlap).
      4. Repeat until the end of the text.
      5. Any trailing slice shorter than chunk_size is kept as-is.

    Args:
        text        : The cleaned document text.
        chunk_size  : Maximum number of characters per chunk.
        chunk_overlap: Number of characters to share between adjacent chunks.

    Returns:
        List of text chunk strings.

    Raises:
        ValueError: If chunk_overlap >= chunk_size (would create an infinite loop).
    """
    if chunk_overlap >= chunk_size:
        raise ValueError(
            f"chunk_overlap ({chunk_overlap}) must be less than chunk_size ({chunk_size})."
        )

    if not text.strip():
        logger.warning("Empty text passed to chunker — returning empty list")
        return []

    chunks: List[str] = []
    start = 0
    step = chunk_size - chunk_overlap

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()

        # Only keep non-empty chunks
        if chunk:
            chunks.append(chunk)

        start += step

    logger.info(f"Document split into {len(chunks)} chunks (size={chunk_size}, overlap={chunk_overlap})")
    return chunks
