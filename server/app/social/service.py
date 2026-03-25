import uuid

from sqlalchemy import delete, func, literal, select, union_all, update
from sqlalchemy.exc import IntegrityError

from app.deps import DbSession
from app.exceptions import DBConflict, DBNotFound
from core.db.models import Friendship, User
from core.db.models.social import FriendshipStatus


async def create_request(session: DbSession, current_user_id: uuid.UUID, target_id: uuid.UUID):
    try:
        request = Friendship(
            sender_id=current_user_id, receiver_id=target_id, status=FriendshipStatus.pending
        )
        session.add(request)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise DBConflict(detail="Unable to create friend request")


async def accept_request(session: DbSession, current_user_id: uuid.UUID, target_id: uuid.UUID):
    stmt = (
        update(Friendship)
        .where(
            Friendship.sender_id == target_id,
            Friendship.receiver_id == current_user_id,
            Friendship.status == FriendshipStatus.pending,
        )
        .values(status=FriendshipStatus.accepted)
    )
    result = await session.execute(stmt)

    if result.rowcount == 0:
        raise DBNotFound(detail="There is no request to accept")

    await session.commit()


async def delete_request(session: DbSession, sender_id: uuid.UUID, receiver_id: uuid.UUID):
    stmt = delete(Friendship).where(
        Friendship.sender_id == sender_id,
        Friendship.receiver_id == receiver_id,
        Friendship.status == FriendshipStatus.pending,
    )
    result = await session.execute(stmt)

    if result.rowcount == 0:
        raise DBNotFound(detail="There is no request to delete")

    await session.commit()


async def list_friendship(session: DbSession, user_id: uuid.UUID, status: FriendshipStatus):
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


async def delete_friend(session: DbSession, current_user_id: uuid.UUID, target_id: uuid.UUID):
    stmt = delete(Friendship).where(
        *friendship_criteria(current_user_id, target_id),
        Friendship.status == FriendshipStatus.accepted,
    )
    result = await session.execute(stmt)

    if result.rowcount == 0:
        raise DBNotFound(detail="friend not found")

    await session.commit()


def friendship_criteria(id_a, id_b):
    return [
        func.least(Friendship.sender_id, Friendship.receiver_id) == func.least(id_a, id_b),
        func.greatest(Friendship.sender_id, Friendship.receiver_id) == func.greatest(id_a, id_b),
    ]
