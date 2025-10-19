from django.core.cache import cache
from .models import ChessOpeningPosition, CACHE_KEYS


def make_context(request, page="default", slug=None):
    """compute heavy page context"""

    context = {
        "cfg": {
            "user": {
                "username": request.user.username,
                "is_auth": request.user.is_authenticated,
            },
        },
        "data": {"positions": get_opening_positions()},
    }

    page_context_fn = PAGES_CONTEXT.get(page)
    if page_context_fn:
        context["cfg"].update(page_context_fn(request=request, slug=slug))

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


def analysis_context(request, slug=None):
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    return {"page": {"orientation": "white", "fen": fen}}


def editor_context(request, slug=None):
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    return {"page": {"orientation": "white", "fen": fen}}


def play_context(request, slug=None):
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    return {"page": {"orientation": "white", "fen": fen}}


PAGES_CONTEXT = {
    "default": analysis_context,
    "analysis": analysis_context,
    "editor": editor_context,
    "play": play_context,
}
