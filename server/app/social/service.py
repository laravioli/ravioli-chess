import uuid

from sqlalchemy import delete, func, select, update
from sqlalchemy.exc import IntegrityError

from app.db.deps import DbSession
from app.exceptions import DBConflict

from .models import Friendship


async def create_request(session: DbSession, current_user_id: uuid.UUID, target_id: uuid.UUID):
    request = Friendship(sender_id=current_user_id, receiver_id=target_id, status="pending")
    session.add(request)
    try:
        await session.commit()
    except IntegrityError:
        raise DBConflict(detail="A friend request already exists.")


async def delete_request(session: DbSession, current_user_id: uuid.UUID, target_id: uuid.UUID):
    low_id, high_id = sorted((current_user_id, target_id))
    stmt = delete(Friendship).where(
        func.least(Friendship.sender_id, Friendship.receiver_id) == low_id,
        func.greatest(Friendship.sender_id, Friendship.receiver_id) == high_id,
    )
    result = await session.execute(stmt)
    await session.commit()

    return result.rowcount > 0


async def accept_request(session: DbSession, current_user_id: uuid.UUID, target_id: uuid.UUID):
    stmt = (
        update(Friendship)
        .where(Friendship.sender_id == target_id, Friendship.receiver_id == current_user_id)
        .values(status="accepted")
    )
    result = await session.execute(stmt)
    await session.commit()

    return result.rowcount > 0


async def list_request(session: DbSession, user_id: uuid.UUID, sender: bool = True):
    filter = (Friendship.sender_id == user_id) if sender else (Friendship.receiver_id == user_id)
    stmt = select(Friendship).where(filter, Friendship.status == "pending")
    result = await session.scalars(stmt)
    await session.commit()

    return result
