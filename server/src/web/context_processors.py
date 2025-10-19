from preferences.models import DEFAULT_PREF

PIECE_IMAGE_MAP = {
    "wP": "white-pawn",
    "bP": "black-pawn",
    "wN": "white-knight",
    "bN": "black-knight",
    "wB": "white-bishop",
    "bB": "black-bishop",
    "wR": "white-rook",
    "bR": "black-rook",
    "wQ": "white-queen",
    "bQ": "black-queen",
    "wK": "white-king",
    "bK": "black-king",
}


def base_context(request):
    """compute light global context"""

    session_pref = request.session.get("user_preferences", {})
    return {
        "preferences": {**DEFAULT_PREF, **session_pref},
        "pieces": PIECE_IMAGE_MAP,
    }
