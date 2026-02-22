from fastapi import APIRouter, status
from fastapi.exceptions import HTTPException
from pydantic import UUID4

from app.auth.deps import CurrentUser
from app.db.deps import DbSession

from .service import accept_request, create_request

router = APIRouter(prefix="/social", tags=["social"])

# request: send , accept, reject , cancel
# todo : finish read https://docs.sqlalchemy.org/en/21/orm/session_basics.html


@router.post("/accept/{target_id}")
async def accept_friend(session: DbSession, user: CurrentUser, target_id: UUID4):
    await accept_request(session, user.id, target_id)


@router.post("/add/{target_id}")
async def add_friend(session: DbSession, user: CurrentUser, target_id: UUID4):
    if user.id == target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can't send a friend request to yourself",
        )
    await create_request(session, user.id, target_id)
