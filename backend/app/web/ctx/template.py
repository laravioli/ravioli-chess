from fastapi import Request
from msgspec import Struct

from .page import PageData
from .user import UserData

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


PAGE_DEFAULT = {
    "orientation": "white",
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
}


def web_context(request: Request):  # noqa: ARG001
    return {"pieces": PIECE_VARS}


class Payload(Struct, frozen=True):
    page: PageData
    user: UserData
