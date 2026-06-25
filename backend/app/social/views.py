from fastapi import APIRouter, status
from fastapi.exceptions import HTTPException
from pydantic import UUID4

from app.auth.deps import AuthUser
from app.deps import DbSession, SocialServiceDep
from app.notif.deps import BackgroundNotifDep
from ravioli_core.db.models.social import FriendshipStatus

from .schemas import Friend, FriendRequest, FriendShip

router = APIRouter(prefix="/social", tags=["social"])


@router.get("/friends/me", response_model=list[Friend])
async def list_my_friends(
    session: DbSession,
    service: SocialServiceDep,
    user: AuthUser,
):
    return await service.list_friendship(session, user.id, status=FriendshipStatus.accepted)


@router.get("/friends/{target_id}", response_model=list[Friend])
async def list_friends(
    session: DbSession,
    service: SocialServiceDep,
    target_id: UUID4,
):
    return await service.list_friendship(session, target_id, status=FriendshipStatus.accepted)


@router.delete("/friends/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_friend(
    background_notif: BackgroundNotifDep,
    session: DbSession,
    service: SocialServiceDep,
    user: AuthUser,
    target_id: UUID4,
):
    await service.delete_friend(
        background_notif, session, current_user_id=user.id, target_id=target_id
    )


@router.get("/requests", response_model=list[FriendRequest])
async def list_friend_request(
    session: DbSession,
    service: SocialServiceDep,
    user: AuthUser,
):
    return await service.list_friendship(session, user.id, status=FriendshipStatus.pending)


@router.post(
    "/requests/{target_id}",
    status_code=status.HTTP_201_CREATED,
    responses={201: {"model": FriendShip}},
)
async def send_friend_request(
    background_notif: BackgroundNotifDep,
    session: DbSession,
    service: SocialServiceDep,
    user: AuthUser,
    target_id: UUID4,
):
    if user.id == target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can't send a friend request to yourself",
        )
    await service.create_request(background_notif, session, user.id, target_id)
    return FriendShip(is_sender=True, status=FriendshipStatus.pending)


@router.delete("/requests/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_friend_request(
    background_notif: BackgroundNotifDep,
    session: DbSession,
    service: SocialServiceDep,
    user: AuthUser,
    target_id: UUID4,
):
    await service.delete_request(background_notif, session, user.id, target_id)


@router.post("/requests/{target_id}/accept", responses={200: {"model": FriendShip}})
async def accept_friend_request(
    background_notif: BackgroundNotifDep,
    session: DbSession,
    service: SocialServiceDep,
    user: AuthUser,
    target_id: UUID4,
):
    await service.accept_request(background_notif, session, target_id, user.id)
    return FriendShip(is_sender=False, status=FriendshipStatus.accepted)


@router.delete("/requests/{target_id}/reject", status_code=status.HTTP_204_NO_CONTENT)
async def reject_friend_request(
    background_notif: BackgroundNotifDep,
    session: DbSession,
    service: SocialServiceDep,
    user: AuthUser,
    target_id: UUID4,
):
    await service.delete_request(background_notif, session, target_id, user.id)
