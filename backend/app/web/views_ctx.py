from typing import TYPE_CHECKING, cast
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.notif.service import NotifService

from .schemas import User

if TYPE_CHECKING:
    from .service import WebService

DEFAULT_CONTEXT = {}
PAGE_DEFAULT = {
    "orientation": "white",
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
}


class ContextBuilder:
    def __init__(self, web: "WebService", notif: NotifService):
        self.web = web
        self.notif = notif

    async def base(
        self,
        session: AsyncSession,
        user: User,
    ):
        data = {}
        if user.is_auth:
            data.update(unreadCount=await self.notif.get_unread_count(session, cast(UUID, user.id)))
        return data

    async def index(
        self,
        session: AsyncSession,
        user: User,
    ):
        data = await self.base(session, user)
        data.update(positions=await self.web.get_chess_positions(session))
        return {"page": PAGE_DEFAULT, "data": data}

    async def analyse(
        self,
        session: AsyncSession,
        user: User,
    ):
        data = await self.base(session, user)
        data.update(positions=await self.web.get_chess_positions(session))
        return {"page": PAGE_DEFAULT, "data": data}

    async def editor(
        self,
        session: AsyncSession,
        user: User,
    ):
        data = await self.base(session, user)
        data.update(positions=await self.web.get_chess_positions(session))
        return {"page": PAGE_DEFAULT, "data": data}

    async def play(
        self,
        session: AsyncSession,
        user: User,
    ):
        data = await self.base(session, user)
        return {"page": PAGE_DEFAULT, "data": data}

    async def profile(
        self,
        session: AsyncSession,
        user: User,
    ):
        data = await self.base(session, user)
        return {"page": PAGE_DEFAULT, "data": data}
