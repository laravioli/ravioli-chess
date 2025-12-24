from typing import Annotated

from app.db.session import DbSession
from app.exceptions import DBError
from fastapi import APIRouter, Query, status
from fastapi.exceptions import HTTPException
from pydantic import UUID4

from .schemas import UserBase, UserCreate, UserSearch, UserWithPref
from .service import user_create, user_delete, user_retrieve, user_search

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.get("/{user_id}", response_model=UserBase)
async def get_user(session: DbSession, user_id: UUID4):
    user = await user_retrieve(session, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user


@router.get("", response_model=list[UserSearch])
async def list_user(session: DbSession, q: Annotated[str | None, Query()] = None):
    return await user_search(session, q) if q else []


@router.post("", response_model=UserWithPref, status_code=status.HTTP_201_CREATED)
async def register_user(session: DbSession, body: UserCreate):
    try:
        new_user = await user_create(session, body)
    except DBError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    else:
        return new_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(session: DbSession, user_id: UUID4):
    is_deleted = await user_delete(session, user_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return None
