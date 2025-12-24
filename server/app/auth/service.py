import secrets
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import DbSession
from app.exceptions import InvalidCredentials
from app.ipc.client import RedisClient
from app.user.models import User

from .deps import SessionCookie
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
    redis: RedisClient,
    user: User,
    expires_in: timedelta = timedelta(days=7),
    session_cookie: SessionCookie = None,
) -> str:
    if session_cookie:
        await redis.delete(f"session:{session_cookie}")

    session_id = secrets.token_urlsafe(32)
    session_key = f"session:{session_id}"

    session_data = {
        "user_id": str(user.id),
        "auth_hash": generate_session_hash(user.hashed_password),
    }

    # we could use a LUA script to check existence here instead
    async with redis.pipeline() as pipe:
        await pipe.hset(session_key, mapping=session_data)
        await pipe.expire(session_key, expires_in)
        await pipe.execute()

    return session_id
