"""
AIMS Chatbot — NLP response engine
Loads knowledge from /public/assets/chatbot/chatbotData.json
Uses RapidFuzz token_set_ratio for fuzzy keyword matching.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional

from rapidfuzz import fuzz

# ─── Load knowledge base at startup ──────────────────────────────────────────

def _load_knowledge() -> dict:
    """
    Resolve path to chatbotData.json relative to the project root.
    The backend/ folder sits at project_root/backend/, so we go up one level
    to find public/assets/chatbot/chatbotData.json.
    """
    backend_dir = Path(__file__).parent
    project_root = backend_dir.parent
    data_path = project_root / "public" / "assets" / "chatbot" / "chatbotData.json"

    if not data_path.exists():
        # Fallback: try src/lib/chatbotData.json (the other copy in the project)
        data_path = project_root / "src" / "lib" / "chatbotData.json"

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

# Minimum fuzzy score (0–100) to consider a keyword a match
MATCH_THRESHOLD = 60


# ─── Response Engine ──────────────────────────────────────────────────────────

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

    # Also check the question text itself (partial match)
    question_score = fuzz.partial_ratio(lower_input, faq.get("question", "").lower())
    if question_score > best:
        best = question_score

    return best


def get_bot_response(user_message: str) -> dict:
    """
    Find the best matching FAQ for a user message.

    Returns a dict with:
        answer         (str)           — always present
        video_url      (str or None)   — filename for navigation video
        navigation_link (str or None)  — internal frontend route e.g. /branches/cse
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
            "video_url": best_faq.get("video"),          # e.g. "cse_lab_navigation.mp4"
            "navigation_link": best_faq.get("link"),     # e.g. "/branches/cse"
        }

    return {
        "answer": DEFAULT_RESPONSE,
        "video_url": None,
        "navigation_link": None,
    }
