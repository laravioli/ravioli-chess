import uuid
from dataclasses import dataclass
from typing import Annotated

from fastapi import Cookie, Depends, Response, status
from fastapi.exceptions import HTTPException

from app.core.config import settings
from app.db.session import DbSession
from app.exceptions import InvalidSession
from app.ipc.client import RedisClient
from app.user.models import User

from .security import verify_session

SessionCookie = Annotated[
    str | None, Cookie(alias=settings.SESSION_COOKIE_NAME, include_in_schema=False)
]


@dataclass
class Session:
    session_id: str
    data: dict[bytes, bytes]


async def get_auth_session(
    redis: RedisClient,
    session_cookie: SessionCookie = None,
) -> Session | None:
    if not session_cookie:
        return
    data = await redis.hgetall(f"session:{session_cookie}")
    if not data:
        raise InvalidSession()
    return Session(session_id=session_cookie, data=data)


async def get_user_or_anon(
    redis: RedisClient,
    db: DbSession,
    response: Response,
    session_cookie: SessionCookie = None,
) -> User | None:
    try:
        auth_session = await get_auth_session(redis, session_cookie)
        if not auth_session:
            return None

        user_id = uuid.UUID(auth_session.data[b"user_id"].decode())
        user = await db.get(User, user_id)
        if not (user and verify_session(user.hashed_password, auth_session.data[b"auth_hash"])):
            await redis.delete(f"session:{auth_session.session_id}")
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
