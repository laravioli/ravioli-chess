from uuid import UUID

from sqlalchemy import and_, delete, select
from sqlalchemy.orm import joinedload

from app.auth.security import generate_password_hash
from app.deps import DbSession
from app.exceptions import DBNotFound
from app.services import Services
from app.social.db import friendship_criteria
from ravioli_core.db.models import Friendship, Preference, User
from ravioli_core.utils import transaction

from .schemas import UserCreate


async def user_create(session: DbSession, data: UserCreate):
    async with transaction(session, error_detail="This username or email already exists"):
        new_user = User(
            username=data.username,
            email=data.email,
            hashed_password=generate_password_hash(data.password.get_secret_value()),
            preference=Preference(),
        )

        session.add(new_user)

    return new_user


async def user_retrieve(session: DbSession, username: str, withPref=False):
    options = []
    if withPref:
        options.append(joinedload(User.preference))
    stmt = select(User).where(User.username == username).options(*options)
    user = await session.scalar(stmt)
    return user


async def user_retrieve_with_friendship(session: DbSession, current_user: User, username: str):
    stmt = (
        select(User, Friendship)
        .outerjoin(
            Friendship,
            and_(*friendship_criteria(current_user.id, User.id)),
        )
        .where(User.username == username)
    )

    result = await session.execute(stmt)
    row = result.first()

    if row is None:
        return None

    user, friendship = row
    if friendship:
        friendship.is_sender = friendship.sender_id == current_user.id
    user.friendship = friendship

    return user


async def user_search(session: DbSession, search_query: str, limit: int):
    stmt = (
        select(User.id, User.username)
        .where(User.username.like(f"{search_query}%"))
        .order_by(User.username)
        .limit(limit)
    )
    users = await session.execute(stmt)
    return users.all()


async def user_delete(session: DbSession, id: UUID) -> bool:
    stmt = delete(User).where(User.id == id)
    result = await session.execute(stmt)

    if result.rowcount == 0:
        raise DBNotFound(detail="User does not exist")

    await session.commit()


async def user_login(session: DbSession, services: Services, user: User):
    try:
        user.unread_count = await services.notif.get_unread_count(session, user.id)
    except Exception:
        user.unread_count = 0
    return user
