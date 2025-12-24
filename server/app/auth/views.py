from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, status
from fastapi.exceptions import HTTPException

from app.core.config import settings
from app.db.session import DbSession
from app.exceptions import InvalidCredentials
from app.ipc.client import RedisClient

from .schemas import UserLogin, UserSuccess
from .service import login

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("", response_model=UserSuccess)
async def login_user(
    redis: RedisClient,
    session: DbSession,
    credentials: UserLogin,
    session_cookie_id: Annotated[str | None, Cookie(alias=settings.SESSION_COOKIE_NAME)] = None,
):
    if session_cookie_id:
        await redis.delete(f"session:{session_cookie_id}")
    try:
        user, session_id = await login(redis, session, credentials)
    except InvalidCredentials:
        pass
    # to finish
    # i think better here to manualy create a response
    # would be better for cookie logic
    # and i should create a cookie.py with setcookie and delete cookie
