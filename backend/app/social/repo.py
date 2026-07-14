from uuid import UUID

from sqlalchemy import delete, func, literal, select, union_all, update
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncSession

from app.exceptions import DBNotFound
from ravioli_core.db.models import FriendRequest, FriendRequestAccepted, Friendship, User
from ravioli_core.db.models.social import FriendshipStatus
from ravioli_core.db.utils import transaction


class SocialRepo:
    async def create_request(
        self,
        session: AsyncSession,
        sender_id: UUID,
        receiver_id: UUID,
    ):
        async with transaction(session, error_detail="Unable to create friend request"):
            request = Friendship(
                sender_id=sender_id,
                receiver_id=receiver_id,
                status=FriendshipStatus.pending,
            )
            session.add(request)
            # flush to get the request id
            await session.flush()

            notification = FriendRequest(
                sender_id=sender_id,
                receiver_id=receiver_id,
                friendship_id=request.id,
            )
            session.add(notification)

    async def accept_request(
        self,
        session: AsyncSession,
        sender_id: UUID,
        receiver_id: UUID,
    ):
        async with transaction(session):
            result = await session.execute(
                update(Friendship)
                .where(
                    Friendship.sender_id == sender_id,
                    Friendship.receiver_id == receiver_id,
                    Friendship.status == FriendshipStatus.pending,
                )
                .values(status=FriendshipStatus.accepted)
                .returning(Friendship.id)
            )

            try:
                friendship_id = result.scalar_one()
            except NoResultFound:
                raise DBNotFound(detail="There is no request to accept")

            await session.execute(
                delete(FriendRequest).where(FriendRequest.friendship_id == friendship_id)
            )

            friend_request_accepted = FriendRequestAccepted(
                sender_id=receiver_id,
                receiver_id=sender_id,
                friendship_id=friendship_id,
            )
            session.add(friend_request_accepted)

    async def delete_request(
        self,
        session: AsyncSession,
        sender_id: UUID,
        receiver_id: UUID,
    ):
        async with transaction(session):
            stmt = delete(Friendship).where(
                Friendship.sender_id == sender_id,
                Friendship.receiver_id == receiver_id,
                Friendship.status == FriendshipStatus.pending,
            )
            result = await session.execute(stmt)

            if result.rowcount == 0:  # type:ignore[attr-defined]
                raise DBNotFound(detail="There is no request to delete")

    async def list_friendship(
        self,
        session: AsyncSession,
        user_id: UUID,
        status: FriendshipStatus,
    ):
        stmt1 = select(
            Friendship.receiver_id.label("friend_id"),
            Friendship.last_update,
            literal("outgoing").label("direction"),
        ).where(Friendship.sender_id == user_id, Friendship.status == status)

        stmt2 = select(
            Friendship.sender_id.label("friend_id"),
            Friendship.last_update,
            literal("incoming").label("direction"),
        ).where(Friendship.receiver_id == user_id, Friendship.status == status)

        subq = union_all(stmt1, stmt2).subquery()

        stmt = (
            select(User.id, User.username, subq.c.last_update, subq.c.direction)
            .join(subq, User.id == subq.c.friend_id)
            .order_by(subq.c.last_update.desc())
        )

        result = await session.execute(stmt)
        return result.all()

    async def delete_friend(
        self,
        conn: AsyncConnection,
        current_user_id: UUID,
        target_id: UUID,
    ):
        async with transaction(conn):
            result = await conn.execute(
                delete(Friendship).where(
                    *self.friendship_criteria(current_user_id, target_id),
                    Friendship.status == FriendshipStatus.accepted,
                )
            )

            if result.rowcount == 0:  # type:ignore[attr-defined]
                raise DBNotFound(detail="friend not found")

    @staticmethod
    def friendship_criteria(id_a, id_b):
        return [
            func.least(Friendship.sender_id, Friendship.receiver_id) == func.least(id_a, id_b),
            func.greatest(Friendship.sender_id, Friendship.receiver_id)
            == func.greatest(id_a, id_b),
        ]
