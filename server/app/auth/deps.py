from typing import Annotated

from fastapi import Cookie, Depends, Response, status
from fastapi.exceptions import HTTPException

from app.config import settings
from app.db.session import DbSession
from app.exceptions import InvalidSession
from app.ipc.client import RedisClient
from app.serializers import msgpack
from app.user.models import User

from .schemas import Session
from .security import verify_session

SessionCookie = Annotated[
    str | None, Cookie(alias=settings.SESSION_COOKIE_NAME, include_in_schema=False)
]


async def get_auth_session(
    redis: RedisClient,
    session_cookie: SessionCookie = None,
) -> Session:
    data = await redis.get(f"session:{session_cookie}")
    if not data:
        raise InvalidSession()

    return msgpack.decode(data, type=Session)


async def get_user_or_anon(
    redis: RedisClient,
    db: DbSession,
    response: Response,
    session_cookie: SessionCookie = None,
) -> User | None:
    if not session_cookie:
        return
    try:
        session = await get_auth_session(redis, session_cookie)
        user = await db.get(User, session.user_id)
        if not (user and verify_session(user.hashed_password, session.auth_hash)):
            await redis.delete(f"session:{session_cookie}")
            raise InvalidSession()
        return user

    except InvalidSession:
        response.delete_cookie(
            key=settings.SESSION_COOKIE_NAME,
            secure=settings.SSL,
            httponly=True,
            samesite="lax",
        )
        return None


async def get_user(user: Annotated[User | None, Depends(get_user_or_anon)]):
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return user
