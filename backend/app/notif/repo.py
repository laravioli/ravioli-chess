from uuid import UUID

from asyncpg import Connection
from fastapi_pagination.ext.asyncpg import apaginate

from ravioli_core.db.queries import NotifQueries
from ravioli_core.db.types import PGConnection

from .schemas import NotifParams, pagination


class NotifRepo:
    @pagination
    async def get_notifications(
        self,
        conn: Connection,
        receiver_id: UUID,
        unread_count: int,
        params: NotifParams = NotifParams(),
    ):

        return await apaginate(
            conn,
            NotifQueries.get_notifications,
            receiver_id,
            params=params,
            additional_data={"unread": unread_count},
        )

    async def unread_count(
        self,
        conn: PGConnection,
        receiver_id: UUID,
    ) -> int | None:
        return await conn.fetchval(NotifQueries.unread_count, receiver_id)

    async def delete_all(
        self,
        conn: PGConnection,
        receiver_id: UUID,
    ):
        await conn.execute(NotifQueries.delete_all, receiver_id)

    async def mark_all_read(self, conn: PGConnection, user_id: UUID):
        await conn.execute(NotifQueries.mark_all_read, user_id)
