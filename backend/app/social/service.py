import logging
import uuid

from sqlalchemy import delete, func, literal, select, union_all, update
from sqlalchemy.exc import IntegrityError

from app.deps import DbSession
from app.exceptions import DBConflict, DBNotFound
from app.notif.deps import NotifService
from ravioli_service.db.models import FriendRequest, Friendship, User
from ravioli_service.db.models.social import FriendshipStatus

logger = logging.getLogger(__name__)


class SocialService:
    def __init__(self, session: DbSession, notifier: NotifService):
        self.session = session
        self.notifier = notifier

    async def create_request(self, sender_id: uuid.UUID, receiver_id: uuid.UUID):
        try:
            request = Friendship(
                sender_id=sender_id,
                receiver_id=receiver_id,
                status=FriendshipStatus.pending,
            )
            self.session.add(request)
            await self.session.flush()

            notification = FriendRequest(
                user_id=receiver_id,
                friendship_id=request.id,
            )
            self.session.add(notification)
            await self.session.commit()
        except IntegrityError as e:
            await self.session.rollback()
            logger.debug(f"DB REQUEST ERROR: {e.orig}")
            raise DBConflict(detail="Unable to create friend request")

        await self.notifier.clear_cache([receiver_id])

    async def accept_request(self, sender_id: uuid.UUID, receiver_id: uuid.UUID):
        stmt = (
            update(Friendship)
            .where(
                Friendship.sender_id == sender_id,
                Friendship.receiver_id == receiver_id,
                Friendship.status == FriendshipStatus.pending,
            )
            .values(status=FriendshipStatus.accepted)
            .returning(Friendship.id)
        )
        result = await self.session.execute(stmt)

        friendship_id = result.scalar_one_or_none()

        if friendship_id is None:
            raise DBNotFound(detail="There is no request to accept")

        delete_notif_stmt = delete(FriendRequest).where(
            FriendRequest.friendship_id == friendship_id
        )

        await self.session.execute(delete_notif_stmt)

        await self.session.commit()
        await self.notifier.clear_cache([receiver_id])

    # todo: create Msg notif, and 2 method, one for cancel-> one auto notif = clear cache receiver,
    # one for reject: 1 auto notif + 1 msg notif = clear cache -> sender and receiver
    async def delete_request(self, sender_id: uuid.UUID, receiver_id: uuid.UUID):
        stmt = delete(Friendship).where(
            Friendship.sender_id == sender_id,
            Friendship.receiver_id == receiver_id,
            Friendship.status == FriendshipStatus.pending,
        )
        result = await self.session.execute(stmt)

        if result.rowcount == 0:
            raise DBNotFound(detail="There is no request to delete")

        await self.session.commit()
        await self.notifier.clear_cache([receiver_id])

    async def list_friendship(self, user_id: uuid.UUID, status: FriendshipStatus):
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

        result = await self.session.execute(stmt)
        return result.all()

    async def delete_friend(self, current_user_id: uuid.UUID, target_id: uuid.UUID):
        stmt = delete(Friendship).where(
            *friendship_criteria(current_user_id, target_id),
            Friendship.status == FriendshipStatus.accepted,
        )
        result = await self.session.execute(stmt)

        if result.rowcount == 0:
            raise DBNotFound(detail="friend not found")

        await self.session.commit()


def friendship_criteria(id_a, id_b):
    return [
        func.least(Friendship.sender_id, Friendship.receiver_id) == func.least(id_a, id_b),
        func.greatest(Friendship.sender_id, Friendship.receiver_id) == func.greatest(id_a, id_b),
    ]


async def create_social_service(session: DbSession, notifier: NotifService):
    return SocialService(session, notifier)
