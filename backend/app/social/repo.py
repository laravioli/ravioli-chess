from uuid import UUID

from app.exceptions import DBNotFound
from ravioli_core.db.models.social import FriendshipStatus
from ravioli_core.db.queries import SocialQueries
from ravioli_core.db.types import PGConnection


class SocialRepo:
    async def create_request(
        self,
        conn: PGConnection,
        sender_id: UUID,
        receiver_id: UUID,
    ):
        await conn.execute(SocialQueries.create_request, sender_id, receiver_id)

    async def accept_request(
        self,
        conn: PGConnection,
        sender_id: UUID,
        receiver_id: UUID,
    ):
        await conn.execute(SocialQueries.accept_request, sender_id, receiver_id)

    async def delete_request(
        self,
        conn: PGConnection,
        sender_id: UUID,
        receiver_id: UUID,
    ):
        result = await conn.fetchval(SocialQueries.delete_request, sender_id, receiver_id)
        if result is None:  # type:ignore[attr-defined]
            raise DBNotFound(detail="There is no request to delete")

    async def list_friendship(
        self,
        conn: PGConnection,
        user_id: UUID,
        status: FriendshipStatus,
    ):
        return await conn.fetch(SocialQueries.list_friendship, user_id, status.value)

    async def delete_friend(
        self,
        conn: PGConnection,
        current_user_id: UUID,
        target_id: UUID,
    ):
        result = await conn.fetchval(SocialQueries.delete_friend, current_user_id, target_id)
        if result is None:  # type:ignore[attr-defined]
            raise DBNotFound(detail="friend not found")
