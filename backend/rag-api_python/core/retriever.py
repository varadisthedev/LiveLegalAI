"""
core/retriever.py
-----------------
Retrieves the top-K most relevant document chunks for a given query.

HOW IT WORKS
------------
1. Embed the query using the same embedding model used at ingest time.
   (Critically important — query and document embeddings must share the same vector space.)
2. L2-normalise the query vector.
3. Run FAISS inner-product search against the document's index.
4. Map the returned integer IDs back to chunk text strings.
5. Return the top-K chunks ranked by similarity score.

This is intentionally simple — a single function with no hidden state.
"""

import numpy as np
import faiss
from typing import List, Tuple
from config import TOP_K_CHUNKS
from core.embeddings import embed_query
from core.vector_store import load_index
from logger import get_logger

logger = get_logger(__name__)


def retrieve_top_chunks(
    document_id: str,
    query: str,
    top_k: int = TOP_K_CHUNKS,
) -> List[str]:
    """
    Find the top-K most relevant chunks for a query from a specific document.

    Args:
        document_id : The document to search within.
        query       : The user's natural-language question or topic.
        top_k       : How many chunks to return (default from config).

    Returns:
        List of chunk text strings, ordered from most to least relevant.

    Raises:
        FileNotFoundError: If the document index does not exist.
    """
    logger.info(f"Retrieving top-{top_k} chunks for document_id='{document_id}'")
    logger.debug(f"Query: '{query[:80]}...' " if len(query) > 80 else f"Query: '{query}'")

    # Step 1: Load the FAISS index and chunk texts from disk
    index, chunks = load_index(document_id)

    # Step 2: Embed the query vector
    query_vector = embed_query(query)

    # Step 3: Reshape to (1, dim) and normalise — must match how we indexed
    query_f32 = np.array([query_vector], dtype=np.float32)
    faiss.normalize_L2(query_f32)

    # Step 4: Search the index — returns distances and indices arrays of shape (1, top_k)
    actual_top_k = min(top_k, index.ntotal)  # Can't retrieve more than what's indexed
    distances, indices = index.search(query_f32, actual_top_k)

    # Step 5: Extract the chunk strings for the retrieved IDs
    retrieved_chunks: List[str] = []
    for rank, (dist, idx) in enumerate(zip(distances[0], indices[0])):
        if idx == -1:
            # FAISS returns -1 for invalid results (shouldn't happen with FlatIP)
            continue
        chunk_text = chunks[idx]
        retrieved_chunks.append(chunk_text)
        logger.debug(f"  Rank {rank + 1}: chunk[{idx}] similarity={dist:.4f} — '{chunk_text[:60]}...'")

    logger.info(f"Top {len(retrieved_chunks)} chunks retrieved successfully")
    return retrieved_chunks


def format_context(chunks: List[str]) -> str:
    """
    Format a list of retrieved chunks into a single context string
    suitable for inclusion in a Claude prompt.

    Each chunk is numbered and separated by a divider for clarity.

    Args:
        chunks: List of retrieved text chunks.

    Returns:
        Multi-line string ready to insert into a prompt.
    """
    parts = []
    for i, chunk in enumerate(chunks, start=1):
        parts.append(f"[DOCUMENT EXCERPT {i}]\n{chunk}")
    return "\n\n---\n\n".join(parts)
