from typing import Annotated

from fastapi import Depends, Response, status
from fastapi.exceptions import HTTPException
from fastapi.requests import HTTPConnection
from sqlalchemy.orm import joinedload

from app.config import settings
from app.deps import DbSession, RedisClient
from app.exceptions import InvalidSession
from core.db.models import User
from lib.serializers import msgpack

from .schemas import Session
from .security import verify_session


async def get_session_cookie(conn: HTTPConnection):
    return conn.cookies.get(settings.SESSION_COOKIE)


type SessionCookie = Annotated[str | None, Depends(get_session_cookie)]


async def get_auth_session(
    redis: RedisClient,
    session_cookie: str,
) -> Session:
    data = await redis.get(f"session:{session_cookie}")
    if not data:
        raise InvalidSession()

    return msgpack.decode(data, type_arg=Session)


def current_user_or_anon(with_pref=False):
    # note : fastapi deps caching rely on function identity
    options = [joinedload(User.preference)] if with_pref else None

    async def dep(
        redis: RedisClient,
        db: DbSession,
        response: Response,
        session_cookie: SessionCookie = None,
    ) -> User | None:
        if not session_cookie:
            return
        try:
            session = await get_auth_session(redis, session_cookie)

            user = await db.get(User, session.user_id, options=options)
            if not (user and verify_session(user.hashed_password, session.auth_hash)):
                await redis.delete(f"session:{session_cookie}")
                raise InvalidSession()
            return user

        except InvalidSession:
            response.delete_cookie(
                key=settings.SESSION_COOKIE,
                secure=settings.SSL,
                httponly=True,
                samesite="lax",
            )
            return None

    return dep


type UserOrAnon = Annotated[User | None, Depends(current_user_or_anon())]
type UserWithPrefOrAnon = Annotated[User | None, Depends(current_user_or_anon(with_pref=True))]


async def current_user(user: UserOrAnon):
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return user


type CurrentUser = Annotated[User, Depends(current_user)]
