from typing import Annotated

from fastapi import Depends, Response, status
from fastapi.exceptions import HTTPException
from fastapi.requests import HTTPConnection
from redis.asyncio import Redis

from app.config import settings
from app.deps import DbConnection, EnvDep, RedisDep
from app.exceptions import InvalidSession
from app.user import User, UserWithPref
from ravioli_core.serializers import msgpack

from .schemas import Session
from .service import AuthService


async def get_session_cookie(conn: HTTPConnection):
    return conn.cookies.get(settings.SESSION_COOKIE)


type SessionCookie = Annotated[str | None, Depends(get_session_cookie)]


async def get_auth_session(
    redis: Redis,
    session_cookie: str,
) -> Session:
    data = await redis.get(f"session:{session_cookie}")
    if data is None:
        raise InvalidSession()

    return msgpack.decode(data, type_arg=Session)


def user_or_anon(*, with_pref: bool):
    # NOTE : fastapi deps caching rely on function identity

    verify = AuthService.verify_user_with_pref if with_pref else AuthService.verify_user

    async def dep(
        env: EnvDep,
        redis: RedisDep,
        conn: DbConnection,
        response: Response,
        session_cookie: SessionCookie = None,
    ):
        if session_cookie is None:
            return

        try:
            session = await get_auth_session(redis, session_cookie)
            user = await verify(env.auth, conn, session)
            if user is None:
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
type UserWithPrefOrAnon = Annotated[UserWithPref | None, Depends(user_or_anon(with_pref=True))]


async def auth_user(user: UserOrAnon):
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return user


type AuthUser = Annotated[User, Depends(auth_user)]
