from fastapi import APIRouter, status
from fastapi.exceptions import HTTPException
from pydantic import UUID4

from app.api.schemas import Message
from app.auth.deps import CurrentUser
from app.background import Publish
from app.deps import DbSession
from app.notif.background import publish_notifications
from core.db.models.social import FriendshipStatus

from .schemas import Friend, FriendRequest
from .service import accept_request, create_request, delete_friend, delete_request, list_friendship

router = APIRouter(prefix="/social", tags=["social"])


@router.get("/friends/me", response_model=list[Friend])
async def list_my_friends(session: DbSession, user: CurrentUser):
    return await list_friendship(session, user.id, status=FriendshipStatus.accepted)


@router.get("/friends/{target_id}", response_model=list[Friend])
async def list_friends(session: DbSession, target_id: UUID4):
    return await list_friendship(session, target_id, status=FriendshipStatus.accepted)


@router.delete("/friends/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_friend(session: DbSession, user: CurrentUser, target_id: UUID4):
    await delete_friend(session, current_user_id=user.id, target_id=target_id)


@router.get("/requests", response_model=list[FriendRequest])
async def list_friend_request(session: DbSession, user: CurrentUser):
    return await list_friendship(session, user.id, status=FriendshipStatus.pending)


@router.post(
    "/requests/{target_id}",
    status_code=status.HTTP_201_CREATED,
    responses={201: {"model": Message}},
)
async def send_friend_request(
    session: DbSession, publish: Publish, user: CurrentUser, target_id: UUID4
):
    if user.id == target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can't send a friend request to yourself",
        )
    await create_request(session, user.id, target_id)
    publish_notifications(publish, target_id)
    return {"message": "request sent"}


@router.delete("/requests/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_friend_request(session: DbSession, user: CurrentUser, target_id: UUID4):
    await delete_request(session, sender_id=user.id, receiver_id=target_id)


@router.post("/requests/{target_id}/accept", responses={200: {"model": Message}})
async def accept_friend_request(session: DbSession, user: CurrentUser, target_id: UUID4):
    await accept_request(session, user.id, target_id)
    return {"message": "request accepted"}


@router.delete("/requests/{target_id}/reject", status_code=status.HTTP_204_NO_CONTENT)
async def reject_friend_request(session: DbSession, user: CurrentUser, target_id: UUID4):
    await delete_request(session, sender_id=target_id, receiver_id=user.id)
