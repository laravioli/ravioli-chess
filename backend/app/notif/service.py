import asyncio
from collections.abc import Iterable
from uuid import UUID

from fastapi_pagination.ext.sqlalchemy import apaginate
from redis.asyncio import Redis
from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession
from sqlalchemy.orm import joinedload

from ravioli_core.db.models import FriendRequest, Friendship, Notification

from .background import BackgroundNotif
from .cache import NotifCache
from .schemas import NotifParams, pagination


class NotifService:
    def __init__(self, cache: NotifCache):
        self.cache = cache

    @pagination
    async def get_notifications(
        self,
        session: AsyncSession,
        user_id: UUID,
        params: NotifParams = NotifParams(),
    ):
        # NOTE non-repeatable READ

        unread_count = await self.get_unread_count(session, user_id)

        stmt = (
            select(Notification)
            .options(joinedload(FriendRequest.friendship).joinedload(Friendship.sender))
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
        )
        return await apaginate(session, stmt, params, additional_data={"unread": unread_count})

    async def get_unread_count(
        self,
        session: AsyncSession,
        user_id: UUID,
    ):
        return await self.cache.get_or_set(
            f"{user_id}", factory=lambda: self._db_unread_count(session, user_id)
        )

    async def _db_unread_count(
        self,
        session: AsyncSession,
        user_id: UUID,
    ):
        return await session.scalar(
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user_id, Notification.read.is_(False))
        )

    async def delete_all(
        self,
        session: AsyncSession,
        user_id: UUID,
    ):
        await session.execute(delete(Notification).where(Notification.user_id == user_id))
        await session.commit()

    async def invalidate(
        self,
        user_ids: Iterable[UUID],
    ):
        coros = [self.cache.delete(f"{user_id}") for user_id in user_ids]
        await asyncio.gather(*coros, return_exceptions=True)

    async def notify_one(
        self,
        notifier: BackgroundNotif,
        session: AsyncSession,
        user_id: UUID,
    ):
        notifications = await self.get_notifications(session, user_id, params=NotifParams())
        notifier.tell_user(user_id, notifications)

    async def notify_many(
        self,
        notifier: BackgroundNotif,
        session: AsyncSession,
        user_ids: Iterable[UUID],
    ):
        coros = [self.notify_one(notifier, session, user_id) for user_id in user_ids]
        await asyncio.gather(*coros, return_exceptions=True)

    async def mark_all_read(self, engine: AsyncEngine, user_id: UUID):
        async with engine.begin() as conn:
            stmt = (
                update(Notification)
                .where(Notification.user_id == user_id, Notification.read.is_(False))
                .values(read=True)
            )
            result = await conn.execute(stmt)

        if result.rowcount > 0:
            await self.cache.set(f"{user_id}", 0)


def make_notif_service(redis: Redis):
    return NotifService(
        cache=NotifCache(
            redis=redis,
            namespace="notifications",
            version="v1",
            data_type=int,
        )
    )
