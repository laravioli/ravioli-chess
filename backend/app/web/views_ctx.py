from app.deps import DbSession

from .deps import WebCache
from .service import get_positions

DEFAULT_CONTEXT = {}
PAGE_DEFAULT = {
    "orientation": "white",
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
}


async def index_ctx(cache: WebCache, session: DbSession):
    data = {"positions": await get_positions(cache, session)}
    return {"page": PAGE_DEFAULT, "data": data}


async def analyse_ctx(cache: WebCache, session: DbSession):
    data = {"positions": await get_positions(cache, session)}
    return {"page": PAGE_DEFAULT, "data": data}


async def editor_ctx(cache: WebCache, session: DbSession):
    data = {"positions": await get_positions(cache, session)}
    return {"page": PAGE_DEFAULT, "data": data}


def play_ctx():
    return {"page": PAGE_DEFAULT}
