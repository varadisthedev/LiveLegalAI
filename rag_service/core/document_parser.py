"""
core/document_parser.py
-----------------------
Responsible for one thing only: extracting raw text from a file.

Supports:
  - PDF  (via pdfplumber — gives better text layout than pypdf)
  - DOCX (via python-docx)

Usage:
    from core.document_parser import parse_document
    raw_text = parse_document("/path/to/file.pdf")
"""

import pdfplumber
from docx import Document as DocxDocument
from logger import get_logger

logger = get_logger(__name__)


def parse_pdf(file_path: str) -> str:
    """
    Extract text from every page of a PDF file.

    pdfplumber preserves text layout better than pypdf,
    which matters for tables and numbered lists in legal docs.

    Args:
        file_path: Absolute or relative path to the PDF.

    Returns:
        Concatenated text from all pages, separated by newlines.

    Raises:
        ValueError: If the PDF contains no extractable text (scanned image PDF).
    """
    logger.info(f"Parsing PDF: {file_path}")
    pages_text = []

    with pdfplumber.open(file_path) as pdf:
        total_pages = len(pdf.pages)
        logger.debug(f"PDF has {total_pages} pages")

        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            if page_text:
                pages_text.append(page_text)
            else:
                logger.warning(f"Page {i + 1} returned no text (may be image-based)")

    if not pages_text:
        raise ValueError(
            "No text could be extracted from this PDF. "
            "It may be a scanned image. Please use a text-based PDF."
        )

    full_text = "\n\n".join(pages_text)
    logger.info(f"PDF parsed successfully — {len(full_text)} characters extracted")
    return full_text


def parse_docx(file_path: str) -> str:
    """
    Extract text from a DOCX file paragraph by paragraph.

    Args:
        file_path: Absolute or relative path to the DOCX file.

    Returns:
        Concatenated paragraph text.

    Raises:
        ValueError: If no text paragraphs are found.
    """
    logger.info(f"Parsing DOCX: {file_path}")
    doc = DocxDocument(file_path)

    paragraphs = [para.text.strip() for para in doc.paragraphs if para.text.strip()]

    if not paragraphs:
        raise ValueError("No readable text paragraphs found in the DOCX file.")

    full_text = "\n\n".join(paragraphs)
    logger.info(f"DOCX parsed successfully — {len(full_text)} characters extracted")
    return full_text


def parse_document(file_path: str) -> str:
    """
    Dispatch to the correct parser based on file extension.

    Args:
        file_path: Path to the uploaded document.

    Returns:
        Raw extracted text string.

    Raises:
        ValueError: If the file type is not supported.
    """
    lower_path = file_path.lower()

    if lower_path.endswith(".pdf"):
        return parse_pdf(file_path)
    elif lower_path.endswith(".docx"):
        return parse_docx(file_path)
    else:
        raise ValueError(
            f"Unsupported file type. Expected .pdf or .docx, got: {file_path}"
        )
