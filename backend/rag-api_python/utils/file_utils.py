"""
utils/file_utils.py
-------------------
File handling utilities for the upload workflow.

Responsibilities:
  - Generate unique document IDs
  - Validate file extensions
  - Save uploaded files to disk safely
  - Clean up temporary files after processing
"""

import os
import re
import uuid
import shutil
from fastapi import UploadFile
from config import UPLOAD_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_MB
from logger import get_logger

logger = get_logger(__name__)

# Ensure the upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# document_id is used verbatim to build filesystem paths (here, and in
# core/vector_store.py for FAISS index files). Must match
# models.request_models.DOCUMENT_ID_REGEX.
DOCUMENT_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,64}$")


def validate_document_id(document_id: str) -> None:
    """
    Raise if document_id isn't safe to use as a filesystem path component.

    Blocks path traversal ('..', '/', '\\') and anything outside a
    conservative safe charset. /analyze and /chat get this for free from
    the Pydantic pattern on AnalyzeRequest/ChatRequest; /ingest accepts an
    optional client-supplied document_id as a plain form field, so it needs
    this check explicitly.
    """
    if not isinstance(document_id, str) or not DOCUMENT_ID_PATTERN.match(document_id):
        raise ValueError(
            "document_id must match ^[A-Za-z0-9_-]{1,64}$ (letters, digits, '_', '-' only)."
        )


def generate_document_id() -> str:
    """
    Generate a unique document identifier.

    Format: "doc_" + first 12 characters of a UUID4 hex string.
    Example: "doc_a3f8c2e10b91"

    Short enough to be readable in logs, long enough to avoid collisions
    for hackathon-scale usage.
    """
    return "doc_" + uuid.uuid4().hex[:12]


def validate_file_extension(filename: str) -> None:
    """
    Raise an error if the file extension is not in ALLOWED_EXTENSIONS.

    Args:
        filename: The original filename from the upload.

    Raises:
        ValueError: If the extension is not allowed.
    """
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"File type '.{ext}' is not supported. "
            f"Allowed types: {', '.join('.' + e for e in ALLOWED_EXTENSIONS)}"
        )


async def save_upload_file(upload_file: UploadFile, document_id: str) -> str:
    """
    Save an uploaded FastAPI UploadFile to disk.

    The file is stored at:  UPLOAD_DIR/{document_id}.{extension}

    Args:
        upload_file : The FastAPI UploadFile object from the request.
        document_id : The already-generated document ID.

    Returns:
        The absolute path to the saved file.

    Raises:
        ValueError: If the file exceeds MAX_FILE_SIZE_MB.
    """
    ext = upload_file.filename.rsplit(".", 1)[-1].lower()
    save_path = os.path.join(UPLOAD_DIR, f"{document_id}.{ext}")

    logger.info(f"Saving uploaded file to {save_path}")

    # Read in chunks to avoid loading huge files into memory at once
    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    total_bytes = 0

    with open(save_path, "wb") as out_file:
        while chunk := await upload_file.read(1024 * 64):  # 64 KB chunks
            total_bytes += len(chunk)
            if total_bytes > max_bytes:
                out_file.close()
                os.remove(save_path)
                raise ValueError(
                    f"File size exceeds the maximum allowed size of {MAX_FILE_SIZE_MB} MB."
                )
            out_file.write(chunk)

    logger.info(f"File saved successfully — {total_bytes / 1024:.1f} KB written")
    return save_path


def delete_file(file_path: str) -> None:
    """
    Delete a file from disk (used for cleanup after ingestion).

    Does not raise if the file doesn't exist — idempotent.
    """
    try:
        os.remove(file_path)
        logger.debug(f"Temporary file deleted: {file_path}")
    except FileNotFoundError:
        logger.warning(f"Tried to delete non-existent file: {file_path}")
