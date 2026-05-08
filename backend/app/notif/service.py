import asyncio
from collections.abc import Iterable
from uuid import UUID

from fastapi_pagination.ext.sqlalchemy import apaginate
from redis.asyncio import Redis
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from ravioli_core.cache import CacheLib
from ravioli_core.db.models import FriendRequest, Friendship, Notification

from .background import BackgroundNotif
from .schemas import NotifParams, pagination


class NotifService:
    def __init__(self, cache: CacheLib):
        self.cache = cache

    @pagination
    async def get_notifications(
        self,
        session: AsyncSession,
        user_id: UUID,
        params: NotifParams = NotifParams(),
    ):

        unread_count = await self.get_unread_count(session, user_id)

        stmt = (
            select(Notification)
            .options(joinedload(FriendRequest.friendship).joinedload(Friendship.sender))
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
        )
        return await apaginate(session, stmt, params, additional_data={"unread": unread_count})

    async def db_unread_count(
        self,
        session: AsyncSession,
        user_id: UUID,
    ):
        return await session.scalar(
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user_id, Notification.read.is_(False))
        )

    async def get_unread_count(
        self,
        session: AsyncSession,
        user_id: UUID,
    ):
        return await self.cache.get_or_set(
            f"{user_id}", factory=lambda: self.db_unread_count(session, user_id)
        )

    async def clear_cache(
        self,
        user_ids: Iterable[UUID],
    ):
        coros = [self.cache.delete(f"{user_id}", f"{user_id}:unread") for user_id in user_ids]
        await asyncio.gather(*coros, return_exceptions=True)

    async def notify_many(
        self,
        notifier: BackgroundNotif,
        session: AsyncSession,
        user_ids: Iterable[UUID],
    ):
        coros = [self.notify_one(notifier, session, user_id) for user_id in user_ids]
        await asyncio.gather(*coros, return_exceptions=True)

    async def notify_one(
        self,
        notifier: BackgroundNotif,
        session: AsyncSession,
        user_id: UUID,
    ):
        notifications = await self.get_notifications(session, user_id, params=NotifParams())
        notifier.tell_user(user_id, notifications)


def make_notif_service(redis: Redis):
    return NotifService(
        cache=CacheLib(
            redis=redis,
            namespace="notifications",
            version="v1",
            default_ttl=300,
            data_type=int,
        )
    )
