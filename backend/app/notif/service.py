from collections.abc import Iterable
from uuid import UUID

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine, AsyncSession

from .background import BackgroundNotif
from .cache import NotifCache
from .db import NotifDB
from .schemas import NotifParams


class NotifService:
    def __init__(self, db: NotifDB, cache: NotifCache):
        self.db = db
        self.cache = cache

    async def get_notifications(
        self,
        conn: AsyncSession | AsyncConnection,
        user_id: UUID,
        params: NotifParams = NotifParams(),
    ):
        unread_count = await self.get_unread_count(conn, user_id)
        return await self.db.get_notifications(conn, user_id, unread_count, params)

    async def get_unread_count(
        self,
        session: AsyncSession | AsyncConnection,
        user_id: UUID,
    ):
        return await self.cache.get_or_set(
            f"{user_id}", factory=lambda: self.db.unread_count(session, user_id)
        )

    async def delete_all(
        self,
        session: AsyncSession,
        user_id: UUID,
    ):
        await self.db.delete_all(session, user_id)

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
        # NOTE: to make this concurrent i would need X separates conn
        for id in user_ids:
            await self.notify_one(notifier, session, id)

    async def mark_all_read(self, engine: AsyncEngine, user_id: UUID):
        await self.db.mark_all_read(engine, user_id)
        # set0 would create write-write race condition with incr
        await self.cache.invalidate_count([user_id])


def make_notif_service(redis: Redis):
    return NotifService(
        db=NotifDB(),
        cache=NotifCache(
            redis=redis,
            namespace="notifications",
            version="v1",
            data_type=int,
        ),
    )
