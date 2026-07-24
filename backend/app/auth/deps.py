from typing import Annotated

from fastapi import Depends, Response, status
from fastapi.exceptions import HTTPException
from fastapi.requests import HTTPConnection

from app.config import settings
from app.deps import EnvDep, PoolConnection
from app.exceptions import InvalidSession
from app.user import User, UserFull
from ravioli_core.db.types import PGConnection

from .service import AuthService, UserGetter
from .structs import VerifiableUser


async def get_session_cookie(conn: HTTPConnection):
    return conn.cookies.get(settings.SESSION_COOKIE)


type SessionCookie = Annotated[str | None, Depends(get_session_cookie)]


async def _user_or_none[T: VerifiableUser](
    auth: AuthService,
    conn: PGConnection,
    session_id: str | None,
    user_getter: UserGetter[T],
    response: Response,
):
    if session_id is None:
        return
    try:
        user = await auth.verify_user_flow(conn, session_id, user_getter)
        return user
    except InvalidSession:
        response.delete_cookie(
            key=settings.SESSION_COOKIE,
            secure=settings.SSL,
            httponly=True,
            samesite="lax",
        )


async def user_or_anon(
    env: EnvDep,
    conn: PoolConnection,
    session_id: SessionCookie,
    response: Response,
):
    return await _user_or_none(env.auth, conn, session_id, env.user.repo.by_id, response)


type UserOrAnon = Annotated[User | None, Depends(user_or_anon)]


async def auth_user(user: UserOrAnon):
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return user


type AuthUser = Annotated[User, Depends(auth_user)]


async def user_full_or_anon(
    env: EnvDep,
    conn: PoolConnection,
    session_id: SessionCookie,
    response: Response,
):
    return await _user_or_none(env.auth, conn, session_id, env.user.repo.by_id_full, response)


type UserFullOrAnon = Annotated[UserFull | None, Depends(user_full_or_anon)]
