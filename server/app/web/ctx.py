from fastapi import Request

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


def web_context(request: Request):
    return {"user": request.state.user, "pieces": PIECE_VARS}
