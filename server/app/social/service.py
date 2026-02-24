import uuid

from sqlalchemy import delete, func, select, union_all, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from app.db.deps import DbSession
from app.exceptions import DBConflict, DBNotFound
from app.user.models import User

from .enums import FriendshipStatus
from .models import Friendship


async def create_request(session: DbSession, current_user_id: uuid.UUID, target_id: uuid.UUID):
    try:
        async with session.begin():
            request = Friendship(
                sender_id=current_user_id, receiver_id=target_id, status=FriendshipStatus.pending
            )
            session.add(request)
    except IntegrityError:
        raise DBConflict(detail="Unable to create friend request")


async def accept_request(session: DbSession, current_user_id: uuid.UUID, target_id: uuid.UUID):
    async with session.begin():
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


async def delete_request(session: DbSession, sender_id: uuid.UUID, receiver_id: uuid.UUID):
    async with session.begin():
        stmt = delete(Friendship).where(
            Friendship.sender_id == sender_id,
            Friendship.receiver_id == receiver_id,
            Friendship.status == FriendshipStatus.pending,
        )
        result = await session.execute(stmt)
    if result.rowcount == 0:
        raise DBNotFound(detail="There is no request to delete")


async def send_request(session: DbSession, current_user_id: uuid.UUID):
    stmt = (
        select(Friendship)
        .where(
            Friendship.sender_id == current_user_id, Friendship.status == FriendshipStatus.pending
        )
        .options(joinedload(Friendship.receiver))
    ).order_by(Friendship.last_update.desc())

    result = await session.scalars(stmt)
    return result.all()


async def receive_request(session: DbSession, current_user_id: uuid.UUID):
    stmt = (
        select(Friendship)
        .where(
            Friendship.receiver_id == current_user_id, Friendship.status == FriendshipStatus.pending
        )
        .options(joinedload(Friendship.sender))
    ).order_by(Friendship.last_update.desc())

    result = await session.scalars(stmt)
    return result.all()


async def list_friendship(session: DbSession, user_id: uuid.UUID, status: FriendshipStatus):
    stmt1 = select(Friendship.receiver_id.label("friend_id"), Friendship.last_update).where(
        Friendship.sender_id == user_id, Friendship.status == status
    )
    stmt2 = select(Friendship.sender_id.label("friend_id"), Friendship.last_update).where(
        Friendship.receiver_id == user_id, Friendship.status == status
    )
    subq = union_all(stmt1, stmt2).subquery()

    stmt = select(User.id, User.username, subq.c.last_update).join(
        subq, User.id == subq.c.friend_id
    )

    res = await session.execute(stmt)
    return res.all()


async def delete_friendship(
    session: DbSession, current_user_id: uuid.UUID, target_id: uuid.UUID, status: FriendshipStatus
):
    low_id, high_id = sorted((current_user_id, target_id))
    async with session.begin():
        stmt = delete(Friendship).where(
            func.least(Friendship.sender_id, Friendship.receiver_id) == low_id,
            func.greatest(Friendship.sender_id, Friendship.receiver_id) == high_id,
            Friendship.status == status,
        )
        result = await session.execute(stmt)

    return result.rowcount > 0
