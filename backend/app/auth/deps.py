from typing import Annotated

from fastapi import Depends, Response, status
from fastapi.exceptions import HTTPException
from fastapi.requests import HTTPConnection

from app.config import settings
from app.deps import DbConnection, RedisClient
from app.exceptions import InvalidSession
from app.user.db import select_user
from ravioli_core.db.models import User
from ravioli_core.serializers import msgpack

from .schemas import Session
from .security import verify_session


async def get_session_cookie(conn: HTTPConnection):
    return conn.cookies.get(settings.SESSION_COOKIE)


type SessionCookie = Annotated[str | None, Depends(get_session_cookie)]

# asyncpg : 1.4k rps
# engine connection: 1.2 rps
# session connection: 1k rps
# TODO: investigate engine connection behavior toward ROLLBACK
# TODO : if consistent i may start using connection and not session


async def get_auth_session(
    redis: RedisClient,
    session_cookie: str,
) -> Session:
    data = await redis.get(f"session:{session_cookie}")
    if not data:
        raise InvalidSession()

    return msgpack.decode(data, type_arg=Session)


def user_or_anon(with_pref=False):
    # NOTE : fastapi deps caching rely on function identity
    stmt = select_user(with_pref)

    async def dep(
        redis: RedisClient,
        conn: DbConnection,
        response: Response,
        session_cookie: SessionCookie = None,
    ):
        if not session_cookie:
            return
        try:
            session = await get_auth_session(redis, session_cookie)

            user = (await conn.execute(stmt, {"user_id": session.user_id})).first()

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


type UserOrAnon = Annotated[User | None, Depends(user_or_anon(with_pref=False))]
type UserWithPrefOrAnon = Annotated[User | None, Depends(user_or_anon(with_pref=True))]


async def auth_user(user: UserOrAnon):
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return user


type AuthUser = Annotated[User, Depends(auth_user)]
