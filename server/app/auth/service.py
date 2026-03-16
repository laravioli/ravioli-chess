import secrets

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.deps import DbSession, RedisClient
from app.exceptions import InvalidCredentials
from core.db.models import User
from lib.serializers import msgpack

from .deps import SessionCookie
from .schemas import Session, UserLogin
from .security import generate_session_hash, verify_password


async def authenticate(session: DbSession, credentials: UserLogin):
    stmt = (
        select(User)
        .where(User.username == credentials.username)
        .options(joinedload(User.preference))
    )
    user = await session.scalar(stmt)

    if user and verify_password(credentials.password.get_secret_value(), user.hashed_password):
        return user
    raise InvalidCredentials()


async def create_session(
    redis: RedisClient,
    user: User,
    expires_in: int,
    session_cookie: SessionCookie = None,
) -> str:
    if session_cookie:
        await redis.delete(f"session:{session_cookie}")

    while True:
        session_id = secrets.token_urlsafe(32)
        session = Session(user_id=user.id, auth_hash=generate_session_hash(user.hashed_password))
        ok = await redis.set(
            name=f"session:{session_id}",
            value=msgpack.encode(session),
            nx=True,
            ex=expires_in,
        )
        if ok:
            break

    return session_id
