from datetime import timedelta

from fastapi import APIRouter, Response, status
from fastapi.exceptions import HTTPException

from app.config import settings
from app.deps import DbSession, RedisClient
from app.exceptions import InvalidCredentials

from .deps import SessionCookie
from .schemas import UserLogin, UserSuccess
from .service import authenticate, create_session

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=UserSuccess)
async def login(
    redis: RedisClient,
    session: DbSession,
    credentials: UserLogin,
    response: Response,
    session_cookie: SessionCookie = None,
):
    try:
        user = await authenticate(session, credentials)
    except InvalidCredentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    expire_in = int(timedelta(days=7).total_seconds())

    session_id = await create_session(
        redis, user, expires_in=expire_in, session_cookie=session_cookie
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
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    redis: RedisClient,
    response: Response,
    session_cookie: SessionCookie = None,
):
    if session_cookie:
        await redis.delete(f"session:{session_cookie}")
    response.delete_cookie(
        key=settings.SESSION_COOKIE,
        secure=settings.SSL,
        httponly=True,
        samesite="lax",
    )
