from uuid import UUID

from fastapi_pagination.ext.sqlalchemy import apaginate
from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine, AsyncSession
from sqlalchemy.orm import joinedload

from ravioli_core.db.models import Notification, User

from .schemas import NotifParams, pagination


class NotifDB:
    @pagination
    async def get_notifications(
        self,
        conn: AsyncSession | AsyncConnection,
        user_id: UUID,
        unread_count: int,
        params: NotifParams = NotifParams(),
    ):

        stmt = (
            select(Notification)
            .where(Notification.receiver_id == user_id)
            .options(joinedload(Notification.sender).load_only(User.username))
            .order_by(Notification.created_at.desc())
        )
        return await apaginate(conn, stmt, params, additional_data={"unread": unread_count})

    async def unread_count(
        self,
        conn: AsyncSession | AsyncConnection,
        user_id: UUID,
    ):
        return await conn.scalar(
            select(func.count())
            .select_from(Notification)
            .where(Notification.receiver_id == user_id, Notification.read.is_(False))
        )

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
