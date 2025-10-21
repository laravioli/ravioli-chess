from preferences.models import DEFAULT_PREFERENCE, SESSION_KEY_PREFERENCE

PIECE_VARS = {
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

    session_preferences = request.session.get(SESSION_KEY_PREFERENCE, {})
    return {
        "preferences": {**DEFAULT_PREFERENCE, **session_preferences},
        "pieces": PIECE_VARS,
    }
