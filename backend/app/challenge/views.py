from fastapi import APIRouter
from pydantic import UUID4

from app.auth.deps import AuthUser, UserOrAnon
from app.challenge import service
from app.deps import DbSession

from .schemas import ChallengeNotif

router = APIRouter(prefix="/challenge", tags=["challenge"])


@router.get("/", response_model=list[ChallengeNotif])
async def list_challenge(
    user: AuthUser,
    session: DbSession,
):
    await service.list_challenge(session, user.id)


@router.post("{challenge_id}/accept")
async def accept_challenge(
    user: UserOrAnon,
    session: DbSession,
    challenge_id: str,
):
    user_id = user.id if user else None
    await service.accept_challenge(session, user_id, challenge_id)


@router.post("{target_id}/reject")
async def reject_challenge(
    user: AuthUser,
    session: DbSession,
    target_id: UUID4,
):
    await service.reject_challenge(session, user.id, target_id)


@router.post("{challenge_id}/cancel")
async def cancel_challenge(
    user: UserOrAnon,
    session: DbSession,
    challenge_id: str,
):
    await service.delete_challenge(session, user, challenge_id)
