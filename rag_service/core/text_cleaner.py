"""
core/text_cleaner.py
--------------------
Cleans raw extracted text before chunking.

Legal documents often have noisy text from PDF extraction:
  - Multiple consecutive blank lines
  - Page headers / footers that repeat on every page
  - Unicode artifacts from scanning or conversion
  - Leading/trailing whitespace per line

Keeping this as a separate step (not inline with parsing or chunking)
makes it easy to improve cleaning rules without touching other modules.
"""

import re
from logger import get_logger

logger = get_logger(__name__)


def remove_excessive_whitespace(text: str) -> str:
    """
    Collapse 3+ consecutive blank lines into 2, and strip trailing spaces per line.
    """
    # Strip trailing whitespace from every line
    lines = [line.rstrip() for line in text.split("\n")]
    text = "\n".join(lines)

    # Replace 3 or more consecutive newlines with exactly 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def remove_unicode_artifacts(text: str) -> str:
    """
    Remove or normalise common Unicode junk that appears in PDFs:
      - Non-breaking spaces → normal space
      - Soft hyphens (­) → empty string
      - Zero-width spaces → empty string
    """
    text = text.replace("\u00a0", " ")   # Non-breaking space
    text = text.replace("\u00ad", "")    # Soft hyphen
    text = text.replace("\u200b", "")    # Zero-width space
    text = text.replace("\ufeff", "")    # BOM marker
    return text


def remove_repeated_headers_footers(text: str) -> str:
    """
    Heuristic: Remove lines that appear 3 or more times
    (typical of page headers / footers like "CONFIDENTIAL" or page numbers).

    This is a best-effort heuristic — not perfect for all documents.
    """
    lines = text.split("\n")
    from collections import Counter

    line_counts = Counter(line.strip() for line in lines if line.strip())

    # Keep a line if it appears fewer than 3 times OR if it's long (real content)
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            cleaned_lines.append(line)
        elif line_counts[stripped] >= 3 and len(stripped) < 80:
            # Likely a repeated header/footer short line — skip it
            pass
        else:
            cleaned_lines.append(line)

    return "\n".join(cleaned_lines)


def clean_text(raw_text: str) -> str:
    """
    Master cleaning function — applies all cleaning steps in order.

    Apply this to the raw output of document_parser before chunking.

    Args:
        raw_text: Raw text extracted from a PDF or DOCX.

    Returns:
        Cleaned, normalised text ready for chunking.
    """
    logger.info("Cleaning extracted text...")

    text = raw_text

    # Step 1: Remove Unicode artifacts
    text = remove_unicode_artifacts(text)
    logger.debug("Unicode artifacts removed")

    # Step 2: Remove repeated headers/footers
    text = remove_repeated_headers_footers(text)
    logger.debug("Repeated headers/footers removed")

    # Step 3: Collapse excessive whitespace
    text = remove_excessive_whitespace(text)
    logger.debug("Whitespace normalised")

    # Step 4: Final strip
    text = text.strip()

    logger.info(f"Text cleaning complete — {len(text)} characters remaining")
    return text
