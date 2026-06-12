from collections.abc import Iterable
from uuid import UUID

from msgspec import Raw
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from ravioli_core.ipc.process.out import TellUser

from .background import BackgroundNotif
from .cache import NotifCache
from .db import NotifDB
from .schemas import NotifParams, notification_ta


class NotifService:
    def __init__(self, db: NotifDB, cache: NotifCache):
        self.db = db
        self.cache = cache

    async def get_notifications(
        self,
        session: AsyncSession,
        user_id: UUID,
        params: NotifParams = NotifParams(),
    ):
        unread_count = await self.get_unread_count(session, user_id)
        return await self.db.get_notifications(session, user_id, unread_count, params)

    async def get_unread_count(
        self,
        session: AsyncSession,
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

    def notify_one(
        self,
        notifier: BackgroundNotif,
        user_id: UUID,
    ):
        async def lazy_notif(session_maker: async_sessionmaker[AsyncSession]):
            async with session_maker() as session:
                notifications = await self.get_notifications(session, user_id, params=NotifParams())
            raw = notification_ta.dump_json(notification_ta.validate_python(notifications))
            return TellUser(type="notifications", data=Raw(raw))

        notifier.tell_user(user_id, lazy_notif)

    def notify_many(
        self,
        notifier: BackgroundNotif,
        user_ids: Iterable[UUID],
    ):
        for user_id in user_ids:
            self.notify_one(notifier, user_id)

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
