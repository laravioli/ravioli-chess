from app.deps import DbSession

from .service import WebService

DEFAULT_CONTEXT = {}
PAGE_DEFAULT = {
    "orientation": "white",
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
}


async def index_ctx(service: WebService, session: DbSession):
    data = {"positions": await service.get_chess_positions(session)}
    return {"page": PAGE_DEFAULT, "data": data}


async def analyse_ctx(service: WebService, session: DbSession):
    data = {"positions": await service.get_chess_positions(session)}
    return {"page": PAGE_DEFAULT, "data": data}


async def editor_ctx(service: WebService, session: DbSession):
    data = {"positions": await service.get_chess_positions(session)}
    return {"page": PAGE_DEFAULT, "data": data}


def play_ctx():
    return {"page": PAGE_DEFAULT}
