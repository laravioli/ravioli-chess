from collections.abc import Iterable
from uuid import UUID

from msgspec import Raw
from redis.asyncio import Redis

from app.background import Background
from ravioli_core.db.types import PGConnection, PGPool
from ravioli_core.ipc.w_in import TellUser

from .cache import NotifCache
from .repo import NotifRepo
from .schemas import NotifParams, notification_ta


class NotifService:
    def __init__(self, redis: Redis, pool: PGPool, db: NotifRepo):
        self._pool = pool
        self._db = db
        self._unread_cache = NotifCache(
            redis=redis,
            name="notifications",
            version="v1",
            value_type=int,
            value_builder=lambda key, conn: db.unread_count(conn, UUID(key)),
        )

    async def get_notifications(
        self,
        conn: PGConnection,
        user_id: UUID,
        params: NotifParams = NotifParams(),
    ):
        unread_count = await self.get_unread_count(conn, user_id)
        return await self._db.get_notifications(conn, user_id, unread_count, params)

    async def get_unread_count(
        self,
        conn: PGConnection,
        user_id: UUID,
    ):
        return await self._unread_cache.get_or_set(str(user_id), conn)

    async def delete_all(
        self,
        conn: PGConnection,
        user_id: UUID,
    ):
        await self._db.delete_all(conn, user_id)

    def notify_one(
        self,
        bg: Background,
        user_id: UUID,
    ):
        async def lazy_notif():
            async with self._pool.acquire() as conn:
                notifications = await self.get_notifications(conn, user_id, params=NotifParams())  # type: ignore
            raw = notification_ta.dump_json(notification_ta.validate_python(notifications))
            return TellUser(type="notifications", data=Raw(raw))

        bg.tell_user(user_id, lazy_notif)

    def notify_many(
        self,
        bg: Background,
        user_ids: Iterable[UUID],
    ):
        for user_id in user_ids:
            self.notify_one(bg, user_id)

    async def mark_all_read(self, user_id: UUID):
        async with self._pool.acquire() as conn:
            await self._db.mark_all_read(conn, user_id)  # type: ignore
        # set0 would create write-write race condition with incr
        await self._unread_cache.delete(str(user_id))

    @staticmethod
    def make(*, pg_pool: PGPool, redis: Redis):
        return NotifService(redis=redis, pool=pg_pool, db=NotifRepo())
