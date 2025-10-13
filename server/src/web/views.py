from django.views.decorators.csrf import ensure_csrf_cookie
from django.core.cache import cache
from .models import ChessOpeningPosition
from django.shortcuts import render


@ensure_csrf_cookie
def index(request, **kwargs):
    context = make_context(request.user, **kwargs)
    return render(request, "web/index.html", context)


def make_context(user, page=None, slug=None):
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    context = {
        "to_json": {
            "cfg": {
                "user": {"username": user.username, "is_auth": user.is_authenticated},
                "page": {"orientation": "white", "fen": fen},
            },
            "data": {"positions": get_opening_positions()},
        }
    }
    return context


def get_opening_positions():
    positions = cache.get(ChessOpeningPosition.CACHE_KEY)
    if positions is None:
        queryset = ChessOpeningPosition.objects.values("eco", "name", "fen").order_by(
            "eco"
        )
        positions = list(queryset)
        cache.set(ChessOpeningPosition.CACHE_KEY, positions, timeout=7776000)

    return positions
