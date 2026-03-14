"""
core/vector_store.py
--------------------
Manages FAISS vector indexes — one index per document.

DESIGN DECISIONS
----------------
- One FAISS index per document_id rather than one global index.
  This makes it trivial to delete a document and avoids cross-document
  contamination in retrieval results.

- Indexes are persisted to disk (FAISS_INDEX_DIR) so they survive
  service restarts (important for hackathon demos!).

- We also save a parallel JSON "metadata" file that maps FAISS integer
  IDs back to the original chunk text. FAISS only stores float vectors;
  it does not store the text itself.

FILE LAYOUT (per document)
--------------------------
  faiss_indexes/
    {document_id}.index          ← FAISS binary index
    {document_id}_chunks.json    ← list of chunk strings (same order as embeddings)

PUBLIC API
----------
  save_index(document_id, embeddings, chunks)
  load_index(document_id) -> (faiss.Index, List[str])
  index_exists(document_id) -> bool
"""

import os
import json
import numpy as np
import faiss
from typing import List, Tuple
from config import FAISS_INDEX_DIR
from logger import get_logger

logger = get_logger(__name__)

# Ensure the storage directory exists at module load time
os.makedirs(FAISS_INDEX_DIR, exist_ok=True)


def _index_path(document_id: str) -> str:
    """Return the file path for the FAISS .index binary file."""
    return os.path.join(FAISS_INDEX_DIR, f"{document_id}.index")


def _chunks_path(document_id: str) -> str:
    """Return the file path for the JSON chunk metadata file."""
    return os.path.join(FAISS_INDEX_DIR, f"{document_id}_chunks.json")


def index_exists(document_id: str) -> bool:
    """
    Check whether a FAISS index has already been persisted for this document.

    Returns:
        True if both the index file and chunks file exist on disk.
    """
    return (
        os.path.exists(_index_path(document_id))
        and os.path.exists(_chunks_path(document_id))
    )


def save_index(
    document_id: str,
    embeddings: np.ndarray,
    chunks: List[str],
) -> None:
    """
    Build a FAISS Flat L2 index from embeddings and persist it to disk.

    Steps:
      1. Validate input shapes.
      2. Normalise embeddings (optional — L2 normalisation improves cosine sim).
      3. Create an IndexFlatIP (inner product — equivalent to cosine sim after normalisation).
      4. Add all vectors.
      5. Write index to disk.
      6. Write chunk texts to a parallel JSON file.

    Args:
        document_id : Unique identifier for the document.
        embeddings  : NumPy array of shape (num_chunks, embedding_dim).
        chunks      : List of text strings, parallel to embeddings rows.

    Raises:
        ValueError: If embeddings and chunks have different lengths.
    """
    if len(embeddings) != len(chunks):
        raise ValueError(
            f"embeddings length ({len(embeddings)}) != chunks length ({len(chunks)})"
        )

    logger.info(f"Building FAISS index for document_id='{document_id}' with {len(chunks)} vectors")

    # Ensure float32 — FAISS requires it
    embeddings_f32 = np.array(embeddings, dtype=np.float32)

    # L2-normalise so inner product == cosine similarity
    faiss.normalize_L2(embeddings_f32)

    embedding_dim = embeddings_f32.shape[1]

    # IndexFlatIP = brute-force inner product (cosine similarity after normalisation)
    # For hackathon scale (<100k chunks), brute-force is fast enough and exact.
    index = faiss.IndexFlatIP(embedding_dim)
    index.add(embeddings_f32)

    # Persist the FAISS binary index
    faiss.write_index(index, _index_path(document_id))
    logger.debug(f"FAISS index written to {_index_path(document_id)}")

    # Persist chunk texts so we can map retrieved IDs back to text
    with open(_chunks_path(document_id), "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)
    logger.debug(f"Chunk metadata written to {_chunks_path(document_id)}")

    logger.info(f"FAISS index saved successfully for document_id='{document_id}'")


def load_index(document_id: str) -> Tuple[faiss.Index, List[str]]:
    """
    Load a previously persisted FAISS index and its chunk texts.

    Args:
        document_id: The document to load.

    Returns:
        Tuple of (faiss.Index, list_of_chunk_strings).

    Raises:
        FileNotFoundError: If the index does not exist on disk.
    """
    if not index_exists(document_id):
        raise FileNotFoundError(
            f"No FAISS index found for document_id='{document_id}'. "
            "Please call /ingest first."
        )

    logger.info(f"Loading FAISS index for document_id='{document_id}'")

    index = faiss.read_index(_index_path(document_id))

    with open(_chunks_path(document_id), "r", encoding="utf-8") as f:
        chunks = json.load(f)

    logger.info(f"FAISS index loaded — {index.ntotal} vectors, {len(chunks)} chunks")
    return index, chunks
