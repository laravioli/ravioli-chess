import uuid

from sqlalchemy import delete, func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql.expression import ColumnElement

from app.db.deps import DbSession
from app.exceptions import DBConflict, DBNotFound

from .models import Friendship


async def create_request(session: DbSession, current_user_id: uuid.UUID, target_id: uuid.UUID):
    try:
        async with session.begin():
            request = Friendship(sender_id=current_user_id, receiver_id=target_id, status="pending")
            session.add(request)
    except IntegrityError:
        raise DBConflict(
            detail="Unable to create friend request: either the user does not exist or a request already exists between these users."
        )


async def accept_request(session: DbSession, current_user_id: uuid.UUID, target_id: uuid.UUID):
    async with session.begin():
        stmt = (
            update(Friendship)
            .where(
                Friendship.sender_id == target_id,
                Friendship.receiver_id == current_user_id,
                Friendship.status == "pending",
            )
            .values(status="accepted")
        )
        result = await session.execute(stmt)

    if result.rowcount == 0:
        raise DBNotFound(detail="There is no request to accept")


async def list_request(session: DbSession, sql_expression: ColumnElement[bool]):
    stmt = select(Friendship).where(sql_expression, Friendship.status == "pending")
    result = await session.scalars(stmt)

    return result


async def request_send(session: DbSession, user_id: uuid.UUID):
    return await list_request(session, sql_expression=(Friendship.sender_id == user_id))


async def request_receive(session: DbSession, user_id: uuid.UUID):
    return await list_request(session, sql_expression=(Friendship.receiver_id == user_id))


async def delete_friendship(session: DbSession, current_user_id: uuid.UUID, target_id: uuid.UUID):
    low_id, high_id = sorted((current_user_id, target_id))
    async with session.begin():
        stmt = delete(Friendship).where(
            func.least(Friendship.sender_id, Friendship.receiver_id) == low_id,
            func.greatest(Friendship.sender_id, Friendship.receiver_id) == high_id,
        )
        result = await session.execute(stmt)

    return result.rowcount > 0
