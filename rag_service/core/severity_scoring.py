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

The full text AND a brief breakdown are returned so the
frontend can display a human-readable explanation.
"""

import re
from typing import Tuple, List
from logger import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Rule definitions
# Each rule is a tuple: (score_contribution, label, regex_pattern)
# ---------------------------------------------------------------------------
SEVERITY_RULES: List[Tuple[int, str, str]] = [
    (
        40,
        "Lawsuit / litigation",
        r"\b(lawsuit|litigation|legal\s+action|sue|sued|court|plaintiff|defendant|claim|complaint|summons|subpoena)\b",
    ),
    (
        20,
        "Deadline / due date",
        r"\b(deadline|due\s+date|by\s+\w+\s+\d{1,2}|within\s+\d+\s+days?|respond\s+within|expire[sd]?|time\s+limit)\b",
    ),
    (
        15,
        "Monetary demand",
        r"(\$[\d,]+|\b\d[\d,]*\s*(dollars?|USD|damages?|compensation|penalty|penalties|fine[sd]?|award))",
    ),
    (
        10,
        "Copyright / DMCA strike",
        r"\b(copyright|DMCA|intellectual\s+property|trademark|infringement|infringe[sd]?|cease\s+and\s+desist)\b",
    ),
    (
        5,
        "Warning notice",
        r"\b(warning|notice|notify|notification|hereby\s+informed|be\s+advised|formal\s+notice)\b",
    ),
]


def compute_severity_score(text: str) -> Tuple[int, List[str]]:
    """
    Compute a severity score for a legal document.

    Each rule is checked against the full document text (case-insensitive).
    Scores are additive and capped at 100.

    Args:
        text: The full cleaned document text.

    Returns:
        (score, triggered_rules) where:
          - score          : int between 0 and 100
          - triggered_rules: human-readable list of rules that fired

    Example:
        score, reasons = compute_severity_score(document_text)
        # score = 60, reasons = ["Lawsuit / litigation (+40)", "Deadline / due date (+20)"]
    """
    logger.info("Computing severity score...")

    total_score = 0
    triggered_rules: List[str] = []

    for points, label, pattern in SEVERITY_RULES:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            total_score += points
            triggered_rules.append(f"{label} (+{points})")
            logger.debug(f"Rule matched: '{label}' (+{points}) — example match: '{match.group()[:40]}'")

    # Cap at 100
    final_score = min(total_score, 100)

    if not triggered_rules:
        logger.info(f"Severity score: {final_score} — no risk indicators detected")
    else:
        logger.info(f"Severity score: {final_score} — triggered rules: {triggered_rules}")

    return final_score, triggered_rules
