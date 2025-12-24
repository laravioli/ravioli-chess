import secrets
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import DbSession
from app.exceptions import InvalidCredentials
from app.ipc.client import RedisClient
from app.user.models import User

from .schemas import UserLogin
from .security import generate_session_hash, verify_password


async def authenticate(session: DbSession, credentials: UserLogin):
    stmt = (
        select(User)
        .where(User.username == credentials.username)
        .options(selectinload(User.preference))
    )
    user = await session.scalar(stmt)

    if user and verify_password(credentials.password.get_secret_value(), user.hashed_password):
        return user
    raise InvalidCredentials()


async def create_session(
    redis: RedisClient, user: User, expires_in: timedelta = timedelta(days=7)
) -> str:
    session_id = secrets.token_urlsafe(32)
    session_key = f"session:{session_id}"

    session_data = {
        "user_id": str(user.id),
        "auth_hash": generate_session_hash(user.hashed_password),
    }

    async with redis.pipeline(transaction=True) as pipe:
        await pipe.hset(session_key, mapping=session_data, nx=True)
        await pipe.expire(session_key, expires_in)
        await pipe.execute()

    return session_id


async def login(redis: RedisClient, session: DbSession, credentials: UserLogin):
    user = await authenticate(session, credentials)
    session_id = await create_session(redis, user)
    return (user, session_id)
