import asyncio
from collections.abc import Iterable
from uuid import UUID

from fastapi_pagination.ext.sqlalchemy import apaginate
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from app.deps import DbSession
from ravioli_core.cache import CacheLib
from ravioli_core.db.models import FriendRequest, Friendship, Notification

from .background import Notifier
from .schemas import NotifParams, pagination


class NotifService:
    def __init__(
        self,
        session: DbSession,
        background: Notifier,
        cache: CacheLib,
    ):
        self.session = session
        self.background = background
        self.cache = cache

    # DB
    @pagination
    async def get_notifications(
        self,
        user_id: UUID,
        params: NotifParams = NotifParams(),
    ):

        unread_count = await self.get_unread_count(user_id)

        stmt = (
            select(Notification)
            .options(joinedload(FriendRequest.friendship).joinedload(Friendship.sender))
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
        )
        return await apaginate(self.session, stmt, params, additional_data={"unread": unread_count})

    async def db_unread_count(self, user_id: UUID):
        return await self.session.scalar(
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user_id, not Notification.read)
        )

    # CACHE
    async def get_unread_count(self, user_id: UUID):
        return await self.cache.get_or_set(
            f"{user_id}", factory=lambda: self.db_unread_count(user_id)
        )

    async def clear_cache(self, user_ids: Iterable[UUID]):
        coros = [self.cache.delete(f"{user_id}", f"{user_id}:unread") for user_id in user_ids]
        await asyncio.gather(*coros, return_exceptions=True)

    # NOTIFY
    async def notify_many(self, user_ids: Iterable[UUID]):
        coros = [self.notify_one(user_id) for user_id in user_ids]
        await asyncio.gather(*coros, return_exceptions=True)

    async def notify_one(self, user_id: UUID):
        notifications = await self.get_notifications(user_id, params=NotifParams())
        self.background.tell_user(user_id, notifications)
