from typing import Annotated

from fastapi import APIRouter, Query, Response, status
from fastapi.exceptions import HTTPException

from app.api.schemas import Message
from app.auth.deps import AuthUser, SessionCookie, UserOrAnon
from app.config import settings
from app.deps import DbSession, RedisClient

from .schemas import UserBase, UserCreate, UserProfile, UserWithPref
from .service import (
    user_create,
    user_delete,
    user_retrieve,
    user_retrieve_with_friendship,
    user_search,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserBase)
async def get_me(me: AuthUser):
    return me


@router.delete("/me", responses={200: {"model": Message}})
async def delete_user(
    session: DbSession,
    user: AuthUser,
    redis: RedisClient,
    response: Response,
    session_cookie: SessionCookie = None,
):
    await user_delete(session, user.id)

    # same logic as logout
    if session_cookie:
        await redis.delete(f"session:{session_cookie}")
    response.delete_cookie(
        key=settings.SESSION_COOKIE,
        secure=settings.SSL,
        httponly=True,
        samesite="lax",
    )
    return {"message": "your account has been deleted"}


@router.get("/{username}", response_model=UserProfile, response_model_exclude_unset=True)
async def get_user(session: DbSession, current_user: UserOrAnon, username: str):

    user = (
        await user_retrieve_with_friendship(session, current_user, username)
        if current_user and (current_user.username != username)
        else await user_retrieve(session, username=username)
    )
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user


@router.get("", response_model=list[UserBase])
async def list_user(
    session: DbSession,
    q: Annotated[str | None, Query()] = None,
    limit: Annotated[int, Query(le=50)] = 20,
):
    return await user_search(session, q, limit) if q else []


@router.post("", response_model=UserWithPref, status_code=status.HTTP_201_CREATED)
async def register_user(session: DbSession, body: UserCreate):
    return await user_create(session, body)
