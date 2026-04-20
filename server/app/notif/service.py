import asyncio
from uuid import UUID

from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.api.schemas import SmallPageFilter
from app.deps import DbSession
from core.db.models import FriendRequest, Friendship, Notification

from .background import Notifier
from .cache import NotifCache


class NotifService:
    def __init__(self, session: DbSession, cache: NotifCache, background: Notifier):
        self.session = session
        self.cache = cache
        self.background = background

    async def db_notifications(
        self,
        user_id: UUID,
        params: SmallPageFilter = SmallPageFilter(),
    ):

        stmt = (
            select(Notification)
            .options(joinedload(FriendRequest.friendship).joinedload(Friendship.sender))
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
        )
        return await paginate(self.session, stmt, params)

    async def get_notifications(
        self,
        user_id: UUID,
        params: SmallPageFilter,
    ):
        if params.is_default_page():
            return await self.cache.get_or_set(
                f"{user_id}",
                factory=lambda: self.db_notifications(user_id, params),
            )
        else:
            return await self.db_notifications(user_id, params)

    async def notify_many(self, user_ids: list[UUID]):
        coros = [self.notify_one(user_id) for user_id in user_ids]
        await asyncio.gather(*coros, return_exceptions=True)

    async def notify_one(self, user_id: UUID):
        notifications = await self.db_notifications(user_id)
        self.background.tell_user(user_id, notifications)

    async def clear_cache(self, user_ids: list[UUID]):
        coros = [self.cache.delete(f"{user_id}") for user_id in user_ids]
        await asyncio.gather(*coros, return_exceptions=True)
