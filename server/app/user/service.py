from uuid import UUID

from app.auth.security import generate_password_hash
from app.db.deps import DbSession
from app.exceptions import DBError
from app.pref.models import Preference
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from .models import User
from .schemas import UserCreate


async def user_create(session: DbSession, data: UserCreate):
    new_user = User(
        username=data.username,
        email=data.email,
        hashed_password=generate_password_hash(data.password.get_secret_value()),
        preference=Preference(),
    )

    session.add(new_user)
    try:
        await session.commit()
    except IntegrityError as e:
        raise DBError("User with this username or email already exists") from e
    else:
        return new_user


async def user_retrieve(session: DbSession, id: UUID, withPref=False):
    options = []
    if withPref:
        options.append(joinedload(User.preference))
    user = await session.get(User, id, options=options)
    return user


async def user_search(session: DbSession, search_query: str):
    stmt = (
        select(User.id, User.username)
        .where(User.username.like(f"{search_query}%"))
        .order_by(User.username)
        .limit(12)
    )
    users = await session.execute(stmt)
    return users.all()


async def user_delete(session: DbSession, id: UUID) -> bool:
    stmt = delete(User).where(User.id == id)
    result = await session.execute(stmt)
    await session.commit()

    return result.rowcount > 0
