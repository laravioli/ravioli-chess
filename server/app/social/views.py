from fastapi import APIRouter, status
from fastapi.exceptions import HTTPException
from pydantic import UUID4

from app.auth.deps import CurrentUser
from core.db.models.social import FriendshipStatus

from .deps import SocialDeps
from .schemas import Friend, FriendRequest, FriendShip

router = APIRouter(prefix="/social", tags=["social"])


@router.get("/friends/me", response_model=list[Friend])
async def list_my_friends(
    service: SocialDeps,
    user: CurrentUser,
):
    return await service.list_friendship(user.id, status=FriendshipStatus.accepted)


@router.get("/friends/{target_id}", response_model=list[Friend])
async def list_friends(
    service: SocialDeps,
    target_id: UUID4,
):
    return await service.list_friendship(target_id, status=FriendshipStatus.accepted)


@router.delete("/friends/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_friend(
    service: SocialDeps,
    user: CurrentUser,
    target_id: UUID4,
):
    await service.delete_friend(current_user_id=user.id, target_id=target_id)


@router.get("/requests", response_model=list[FriendRequest])
async def list_friend_request(
    service: SocialDeps,
    user: CurrentUser,
):
    return await service.list_friendship(user.id, status=FriendshipStatus.pending)


@router.post(
    "/requests/{target_id}",
    status_code=status.HTTP_201_CREATED,
    responses={201: {"model": FriendShip}},
)
async def send_friend_request(
    service: SocialDeps,
    user: CurrentUser,
    target_id: UUID4,
):
    if user.id == target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can't send a friend request to yourself",
        )
    await service.create_request(user.id, target_id)
    return FriendShip(is_sender=True, status="pending")


@router.delete("/requests/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_friend_request(
    service: SocialDeps,
    user: CurrentUser,
    target_id: UUID4,
):
    await service.delete_request(sender_id=user.id, receiver_id=target_id)


@router.post("/requests/{target_id}/accept", responses={200: {"model": FriendShip}})
async def accept_friend_request(
    service: SocialDeps,
    user: CurrentUser,
    target_id: UUID4,
):
    await service.accept_request(user.id, target_id)
    return FriendShip(is_sender=False, status="accepted")


@router.delete("/requests/{target_id}/reject", status_code=status.HTTP_204_NO_CONTENT)
async def reject_friend_request(
    service: SocialDeps,
    user: CurrentUser,
    target_id: UUID4,
):
    await service.delete_request(sender_id=target_id, receiver_id=user.id)
