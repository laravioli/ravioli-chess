from collections.abc import Iterable
from uuid import UUID

from msgspec import Raw
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from app.background import Background
from ravioli_core.db.types import PGConnection
from ravioli_core.ipc.w_in import TellUser

from .cache import NotifCache
from .repo import NotifRepo
from .schemas import NotifParams, notification_ta


class NotifService:
    def __init__(self, db: NotifRepo, cache: NotifCache):
        self._db = db
        self._cache = cache

    async def get_notifications(
        self,
        conn: PGConnection,
        session: AsyncSession,
        user_id: UUID,
        params: NotifParams = NotifParams(),
    ):
        unread_count = await self.get_unread_count(conn, user_id)
        return await self._db.get_notifications(session, user_id, unread_count, params)

    async def get_unread_count(
        self,
        conn: PGConnection,
        user_id: UUID,
    ):
        return await self._cache.get_or_set(
            f"{user_id}", factory=lambda: self._db.unread_count(conn, user_id)
        )

    async def delete_all(
        self,
        session: AsyncSession,
        user_id: UUID,
    ):
        await self._db.delete_all(session, user_id)

    def notify_one(
        self,
        conn: PGConnection,
        bg: Background,
        user_id: UUID,
    ):
        async def lazy_notif(session_maker: async_sessionmaker[AsyncSession]):
            async with session_maker() as session:
                notifications = await self.get_notifications(
                    conn, session, user_id, params=NotifParams()
                )
            raw = notification_ta.dump_json(notification_ta.validate_python(notifications))
            return TellUser(type="notifications", data=Raw(raw))

        bg.tell_user(user_id, lazy_notif)

    def notify_many(
        self,
        conn: PGConnection,
        bg: Background,
        user_ids: Iterable[UUID],
    ):
        for user_id in user_ids:
            self.notify_one(conn, bg, user_id)

    async def mark_all_read(self, engine: AsyncEngine, user_id: UUID):
        await self._db.mark_all_read(engine, user_id)
        # set0 would create write-write race condition with incr
        await self._cache.invalidate_count([user_id])

    @staticmethod
    def make(*, redis: Redis):
        return NotifService(
            db=NotifRepo(),
            cache=NotifCache(
                redis=redis,
                namespace="notifications",
                version="v1",
                data_type=int,
            ),
        )
