"""
core/severity_scoring.py
------------------------
Rule-based severity scoring for legal documents.

WHY RULE-BASED?
---------------
For a hackathon deadline, rule-based scoring is:
  - Fast to implement
  - Fully deterministic and debuggable
  - Easy to explain to judges ("the score is +40 because the word 'lawsuit' appears")
  - Easy to extend with more rules later

SCORING RULES (additive, capped at 100)
----------------------------------------
  +40  — lawsuit / litigation mentioned
  +20  — deadline / due date detected
  +15  — monetary demand (dollar amount, damages, etc.)
  +10  — copyright / DMCA strike
  + 5  — general warning notice

Returns BOTH:
  - numeric score (0–100)
  - structured risk_factors list (for frontend graph rendering)
  - risk_level label ("Low", "Moderate", "High")
  - auto-detected document_type
"""

import re
from typing import Tuple, List, Dict, Any
from logger import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Rule definitions
# Each rule: (points, label, category, pattern)
# category is used by frontend to group bars on the severity chart
# ---------------------------------------------------------------------------
SEVERITY_RULES: List[Tuple[int, str, str, str]] = [
    (
        40,
        "Lawsuit / litigation",
        "legal_action",
        r"\b(lawsuit|litigation|legal\s+action|sue|sued|court|plaintiff|defendant|claim|complaint|summons|subpoena)\b",
    ),
    (
        20,
        "Deadline / due date",
        "deadline",
        r"\b(deadline|due\s+date|by\s+\w+\s+\d{1,2}|within\s+\d+\s+days?|respond\s+within|expire[sd]?|time\s+limit)\b",
    ),
    (
        15,
        "Monetary demand",
        "financial",
        r"(\$[\d,]+|\b\d[\d,]*\s*(dollars?|USD|damages?|compensation|penalty|penalties|fine[sd]?|award))",
    ),
    (
        10,
        "Copyright / DMCA strike",
        "ip",
        r"\b(copyright|DMCA|intellectual\s+property|trademark|infringement|infringe[sd]?|cease\s+and\s+desist)\b",
    ),
    (
        5,
        "Warning notice",
        "notice",
        r"\b(warning|notice|notify|notification|hereby\s+informed|be\s+advised|formal\s+notice)\b",
    ),
]


# ---------------------------------------------------------------------------
# Document type detection patterns
# ---------------------------------------------------------------------------
DOCUMENT_TYPE_PATTERNS = [
    (r"\b(copyright|DMCA|content\s+ID|community\s+guideline|strike)\b", "Copyright / DMCA Strike"),
    (r"\b(cease\s+and\s+desist)\b", "Cease and Desist"),
    (r"\b(summons|subpoena|court\s+order|appear\s+before)\b", "Court Summons"),
    (r"\b(contract|agreement|terms|clause|party|parties)\b", "Contract / Agreement"),
    (r"\b(lease|tenant|landlord|rent|eviction)\b", "Lease / Rental Notice"),
    (r"\b(invoice|payment|overdue|outstanding\s+balance)\b", "Payment Demand"),
    (r"\b(termination|fired|employment|severance)\b", "Employment Notice"),
]


def detect_document_type(text: str) -> str:
    """
    Auto-detect the type of legal document from its content.
    Returns a human-readable label.
    """
    text_lower = text.lower()
    for pattern, doc_type in DOCUMENT_TYPE_PATTERNS:
        if re.search(pattern, text_lower):
            return doc_type
    return "Legal Notice"


def compute_severity_score(text: str) -> Tuple[int, List[str], List[Dict[str, Any]], str]:
    """
    Compute severity score with full breakdown for frontend rendering.

    Args:
        text: The full cleaned document text.

    Returns:
        (score, triggered_rules, risk_factors, risk_level) where:
          - score           : int between 0 and 100
          - triggered_rules : human-readable list (e.g. ["Lawsuit (+40)"])
          - risk_factors    : structured dicts for frontend graph:
                              [{"label": "...", "points": 40, "category": "legal_action"}, ...]
          - risk_level      : "Low" | "Moderate" | "High"
    """
    logger.info("Computing severity score...")

    total_score = 0
    triggered_rules: List[str] = []
    risk_factors: List[Dict[str, Any]] = []

    for points, label, category, pattern in SEVERITY_RULES:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            total_score += points
            triggered_rules.append(f"{label} (+{points})")
            risk_factors.append({
                "label": label,
                "points": points,
                "category": category,
            })
            logger.debug(f"Rule matched: '{label}' (+{points}) — example match: '{match.group()[:40]}'")

    # Cap at 100
    final_score = min(total_score, 100)

    # Determine risk level
    if final_score <= 30:
        risk_level = "Low"
    elif final_score <= 65:
        risk_level = "Moderate"
    else:
        risk_level = "High"

    if not triggered_rules:
        logger.info(f"Severity score: {final_score} — no risk indicators detected")
    else:
        logger.info(f"Severity score: {final_score} ({risk_level}) — triggered rules: {triggered_rules}")

    return final_score, triggered_rules, risk_factors, risk_level
