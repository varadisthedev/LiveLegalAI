"""
core/document_registry.py
-------------------------
In-memory registry of all ingested documents.

This keeps track of metadata for every document that has been ingested,
so the frontend can query a list of all documents, their analysis status,
and basic info — without needing an external database.

For a hackathon, this in-memory approach is perfect.
In production, you'd swap this for a database table.

THREAD SAFETY: FastAPI runs on a single Python process by default,
so a plain dict is safe. If you add workers, switch to Redis or SQLite.
"""

import os
import json
from datetime import datetime, timezone
from typing import Dict, Optional, List
from logger import get_logger

logger = get_logger(__name__)

# In-memory store: document_id → metadata dict
_registry: Dict[str, dict] = {}

# Persist registry to disk so it survives server restarts
_REGISTRY_FILE = os.path.join(os.path.dirname(__file__), "..", "faiss_indexes", "_registry.json")


def _save_to_disk():
    """Best-effort persist registry to JSON file."""
    try:
        os.makedirs(os.path.dirname(_REGISTRY_FILE), exist_ok=True)
        with open(_REGISTRY_FILE, "w") as f:
            json.dump(_registry, f, indent=2)
    except Exception as e:
        logger.warning(f"Could not persist registry to disk: {e}")


def _load_from_disk():
    """Load registry from disk on startup."""
    global _registry
    try:
        if os.path.exists(_REGISTRY_FILE):
            with open(_REGISTRY_FILE, "r") as f:
                _registry = json.load(f)
            logger.info(f"Loaded document registry from disk: {len(_registry)} documents")
    except Exception as e:
        logger.warning(f"Could not load registry from disk: {e}")
        _registry = {}


# Load on module import (server startup)
_load_from_disk()


def register_document(document_id: str, filename: str, num_chunks: int):
    """Register a newly ingested document."""
    _registry[document_id] = {
        "document_id": document_id,
        "filename": filename,
        "num_chunks": num_chunks,
        "ingested_at": datetime.now(timezone.utc).isoformat(),
        "analyzed": False,
        "severity_score": None,
        "risk_level": None,
        "summary_preview": None,
        "document_type": None,
    }
    _save_to_disk()
    logger.info(f"Registered document: {document_id} ({filename})")


def mark_analyzed(document_id: str, severity_score: int, risk_level: str, summary: str, document_type: str):
    """Update a document's record after analysis is complete."""
    if document_id in _registry:
        _registry[document_id]["analyzed"] = True
        _registry[document_id]["severity_score"] = severity_score
        _registry[document_id]["risk_level"] = risk_level
        _registry[document_id]["summary_preview"] = summary[:150] if summary else None
        _registry[document_id]["document_type"] = document_type
        _save_to_disk()
        logger.info(f"Marked document as analyzed: {document_id}")


def get_document(document_id: str) -> Optional[dict]:
    """Get metadata for a single document."""
    return _registry.get(document_id)


def get_all_documents() -> List[dict]:
    """Get all documents, sorted by most recent first."""
    docs = list(_registry.values())
    docs.sort(key=lambda d: d.get("ingested_at", ""), reverse=True)
    return docs


def document_exists(document_id: str) -> bool:
    """Check if a document has been ingested."""
    return document_id in _registry
