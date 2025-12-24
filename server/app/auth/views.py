from datetime import timedelta

from fastapi import APIRouter, Response, status
from fastapi.exceptions import HTTPException

from app.core.config import settings
from app.db.session import DbSession
from app.exceptions import InvalidCredentials
from app.ipc.client import RedisClient

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

    session_id = await create_session(redis, user, session_cookie=session_cookie)

    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=session_id,
        max_age=int(timedelta(days=7).total_seconds()),
        secure=settings.SSL,
        httponly=True,
        samesite="lax",
    )
    return user
