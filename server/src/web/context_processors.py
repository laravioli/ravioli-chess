from preferences.models import DEFAULT_PREF

PIECE_IMAGE_MAP = {
    "---white-pawn": "wP",
    "---black-pawn": "bP",
    "---white-knight": "wN",
    "---black-knight": "bN",
    "---white-bishop": "wB",
    "---black-bishop": "bB",
    "---white-rook": "wR",
    "---black-rook": "bR",
    "---white-queen": "wQ",
    "---black-queen": "bQ",
    "---white-king": "wK",
    "---black-king": "bK",
}


def base_context(request):
    """compute light global context"""

    session_pref = request.session.get("user_preferences", {})
    return {
        "preferences": {**DEFAULT_PREF, **session_pref},
        "pieces": PIECE_IMAGE_MAP,
    }
