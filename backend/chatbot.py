"""
AIMS Chatbot — NLP response engine
Loads knowledge from chatbotData.json in the same directory.
Uses RapidFuzz token_set_ratio for fuzzy keyword matching.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from rapidfuzz import fuzz


# ─── Load knowledge base at startup ──────────────────────────────────────────

def _load_knowledge() -> dict:
    """
    Load chatbotData.json from the same directory as this script.
    """

    base_dir = Path(__file__).resolve().parent
    data_path = base_dir / "chatbotData.json"

    if not data_path.exists():
        raise FileNotFoundError(
            f"chatbotData.json not found. Expected at: {data_path}"
        )

    with open(data_path, encoding="utf-8") as f:
        return json.load(f)


_knowledge: dict = _load_knowledge()

FAQS: list[dict] = _knowledge.get("faqs", [])
DEFAULT_RESPONSE: str = _knowledge.get(
    "defaultResponse",
    "I'm not sure about that. Please contact the admin office for help."
)

MATCH_THRESHOLD = 60


# ─── Matching Logic ──────────────────────────────────────────────────────────

def _score_faq(user_input: str, faq: dict) -> float:
    """
    Score a single FAQ entry against user input.
    Returns the best RapidFuzz token_set_ratio score across all keywords.
    """
    best = 0.0
    lower_input = user_input.lower().strip()

    for keyword in faq.get("keywords", []):
        score = fuzz.token_set_ratio(lower_input, keyword.lower())
        if score > best:
            best = score

    question_score = fuzz.partial_ratio(
        lower_input,
        faq.get("question", "").lower()
    )

    if question_score > best:
        best = question_score

    return best


# ─── Public Chatbot Function ─────────────────────────────────────────────────

def get_bot_response(user_message: str) -> dict:
    """
    Find the best matching FAQ for a user message.

    Returns:
        {
            "answer": str,
            "video_url": str | None,
            "navigation_link": str | None
        }
    """

    if not user_message or not user_message.strip():
        return {
            "answer": DEFAULT_RESPONSE,
            "video_url": None,
            "navigation_link": None,
        }

    best_score = 0.0
    best_faq: Optional[dict] = None

    for faq in FAQS:
        score = _score_faq(user_message, faq)
        if score > best_score:
            best_score = score
            best_faq = faq

    if best_faq and best_score >= MATCH_THRESHOLD:
        return {
            "answer": best_faq.get("answer", DEFAULT_RESPONSE),
            "video_url": best_faq.get("video"),
            "navigation_link": best_faq.get("link"),
        }

    return {
        "answer": DEFAULT_RESPONSE,
        "video_url": None,
        "navigation_link": None,
    }
