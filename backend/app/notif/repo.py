from uuid import UUID

from fastapi_pagination.ext.sqlalchemy import apaginate
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession
from sqlalchemy.orm import joinedload

from ravioli_core.db.models import Notification, SA_User
from ravioli_core.db.queries import NotifQueries
from ravioli_core.db.types import PGConnection

from .schemas import NotifParams, pagination


class NotifRepo:
    @pagination
    async def get_notifications(
        self,
        session: AsyncSession,
        user_id: UUID,
        unread_count: int,
        params: NotifParams = NotifParams(),
    ):

        stmt = (
            select(Notification)
            .where(Notification.receiver_id == user_id)
            .options(joinedload(Notification.sender).load_only(SA_User.username))
            .order_by(Notification.created_at.desc())
        )
        return await apaginate(session, stmt, params, additional_data={"unread": unread_count})

    async def unread_count(
        self,
        conn: PGConnection,
        user_id: UUID,
    ) -> int | None:
        return await conn.fetchval(NotifQueries.unread_count, user_id)

    async def delete_all(
        self,
        session: AsyncSession,
        user_id: UUID,
    ):
        await session.execute(delete(Notification).where(Notification.receiver_id == user_id))
        await session.commit()

    async def mark_all_read(self, engine: AsyncEngine, user_id: UUID):
        async with engine.begin() as conn:
            stmt = (
                update(Notification)
                .where(Notification.receiver_id == user_id, Notification.read.is_(False))
                .values(read=True)
            )
            await conn.execute(stmt)
