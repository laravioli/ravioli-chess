from django.core.cache import cache
from .models import ChessOpeningPosition, CACHE_KEYS


# General context
def make_context(user, page="default", slug=None):

    context = {
        "cfg": {
            "user": {"username": user.username, "is_auth": user.is_authenticated},
        },
        "data": {"positions": get_opening_positions()},
    }

    page_context_fn = PAGES_CONTEXT.get(page)
    if page_context_fn:
        context["cfg"].update(page_context_fn(user=user, slug=slug))

    return {"to_json": context}


def get_opening_positions():
    positions = cache.get(CACHE_KEYS["opening_positions"])
    if positions is None:
        queryset = ChessOpeningPosition.objects.values("eco", "name", "fen").order_by(
            "eco"
        )
        positions = list(queryset)
        cache.set(CACHE_KEYS["opening_positions"], positions, timeout=7776000)

    return positions


# Page context
def analysis_context(user=None, slug=None):
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    return {"page": {"orientation": "white", "fen": fen}}


def editor_context(user=None, slug=None):
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    return {"page": {"orientation": "white", "fen": fen}}


def play_context(user=None, slug=None):
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    return {"page": {"orientation": "white", "fen": fen}}


PAGES_CONTEXT = {
    "default": analysis_context,
    "analysis": analysis_context,
    "editor": editor_context,
    "play": play_context,
}
