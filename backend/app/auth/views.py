from datetime import timedelta

from fastapi import APIRouter, Response, status
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.deps import DbConnection
from app.env import Env
from app.exceptions import InvalidCredentials

from .deps import SessionCookie
from .schemas import UserLogin, UserSuccess


def create_auth_api_router(env: Env):
    router = APIRouter(prefix="/auth", tags=["auth"])

    @router.post("/login", response_model=UserSuccess)
    async def login(
        conn: DbConnection,
        credentials: UserLogin,
        response: Response,
        session_cookie: SessionCookie = None,
    ):
        try:
            user = await env.auth.authenticate(conn, credentials)
        except InvalidCredentials:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

        expire_in = int(timedelta(days=7).total_seconds())

        session_id = await env.auth.create_session(
            user, expires_in=expire_in, session_cookie=session_cookie
        )

        response.set_cookie(
            key=settings.SESSION_COOKIE,
            value=session_id,
            max_age=expire_in,
            secure=settings.SSL,
            httponly=True,
            samesite="lax",
        )
        response.delete_cookie(
            key=settings.ANON_COOKIE,
            secure=settings.SSL,
            httponly=True,
            samesite="lax",
        )
        try:
            async with AsyncSession(bind=conn) as session:
                unread_count = await env.notif.get_unread_count(session, user.id)
        except Exception:
            unread_count = 0

        return UserSuccess(
            id=user.id,
            username=user.username,
            preference=user.preference,
            unread_count=unread_count,
        )

    @router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
    async def logout(
        response: Response,
        session_cookie: SessionCookie = None,
    ):
        if session_cookie:
            await env.core.redis.delete(f"session:{session_cookie}")
        response.delete_cookie(
            key=settings.SESSION_COOKIE,
            secure=settings.SSL,
            httponly=True,
            samesite="lax",
        )

    return router
