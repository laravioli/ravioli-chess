from typing import cast
from uuid import UUID

from app.deps import DbSession, Services

from .schemas import User

DEFAULT_CONTEXT = {}
PAGE_DEFAULT = {
    "orientation": "white",
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
}


async def base_data(user: User, services: Services, session: DbSession):
    data = {}
    if user.is_auth:
        data.update(unreadCount=await services.notif.get_unread_count(session, cast(UUID, user.id)))
    return data


async def index_ctx(user: User, services: Services, session: DbSession):
    data = await base_data(user, services, session)
    data.update(positions=await services.web.get_chess_positions(session))
    return {"page": PAGE_DEFAULT, "data": data}


async def analyse_ctx(user: User, services: Services, session: DbSession):
    data = await base_data(user, services, session)
    data.update(positions=await services.web.get_chess_positions(session))
    return {"page": PAGE_DEFAULT, "data": data}


async def editor_ctx(user: User, services: Services, session: DbSession):
    data = await base_data(user, services, session)
    data.update(positions=await services.web.get_chess_positions(session))
    return {"page": PAGE_DEFAULT, "data": data}


async def play_ctx(user: User, services: Services, session: DbSession):
    data = await base_data(user, services, session)
    return {"page": PAGE_DEFAULT, "data": data}


async def profile_ctx(user: User, services: Services, session: DbSession):
    data = await base_data(user, services, session)
    return {"page": PAGE_DEFAULT, "data": data}
