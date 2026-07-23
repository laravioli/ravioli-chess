from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Annotated, Literal

from fastapi import Depends, Response, status
from fastapi.exceptions import HTTPException
from fastapi.requests import HTTPConnection

from app.config import settings
from app.deps import EnvDep, PoolConnection
from app.exceptions import InvalidSession
from app.user import User
from app.user.service import UserRepo

from .service import AuthService, UserGetter
from .structs import VerifiableUser


async def get_session_cookie(conn: HTTPConnection):
    return conn.cookies.get(settings.SESSION_COOKIE)


type SessionCookie = Annotated[str | None, Depends(get_session_cookie)]


@dataclass
class AuthFlow[T: VerifiableUser]:
    user_or_none: Callable[[PoolConnection, SessionCookie, Response], Awaitable[T | None]]
    auth_user: Callable[[PoolConnection, SessionCookie, Response], Awaitable[T]]


def make_flow[T: VerifiableUser](
    auth: AuthService,
    user_getter: UserGetter[T],
):
    async def user_or_none(conn: PoolConnection, session_id: SessionCookie, response: Response):
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

    async def auth_user(conn: PoolConnection, session_id: SessionCookie, response: Response):
        user = await user_or_none(conn, session_id, response)
        if user is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
        return user

    return AuthFlow(user_or_none, auth_user)


class AuthUserDep:
    def __init__(self, key: Literal["user_or_anon", "auth_user"]):
        self.key = key

    async def __call__(
        self,
        conn: HTTPConnection,
        db_conn: PoolConnection,
        session_id: SessionCookie,
        response: Response,
    ):
        flow = conn.state[self.key]

        return await flow(
            db_conn,
            session_id,
            response,
        )


def wire_auth_dep(auth: AuthService, user_repo: UserRepo):
    user_flow = make_flow(auth, user_repo.by_id)
    return {"user_or_anon": user_flow.user_or_none, "auth_user": user_flow.auth_user}


# type UserOrAnon = Annotated[User | None, Depends(AuthUserDep("user_or_anon"))]
type UserWithPrefOrAnon = Annotated[User | None, Depends(AuthUserDep("user_or_anon"))]
# type AuthUser = Annotated[User, Depends(AuthUserDep("auth_user"))]


async def user_or_anon(
    env: EnvDep,
    conn: PoolConnection,
    session_id: SessionCookie,
    response: Response,
):
    if session_id is None:
        return
    try:
        user = await env.auth.verify_user_flow(conn, session_id, env.user.repo.by_id)
        return user
    except InvalidSession:
        response.delete_cookie(
            key=settings.SESSION_COOKIE,
            secure=settings.SSL,
            httponly=True,
            samesite="lax",
        )


type UserOrAnon = Annotated[User | None, Depends(user_or_anon)]


async def auth_user(user: UserOrAnon):
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return user


type AuthUser = Annotated[User, Depends(auth_user)]
