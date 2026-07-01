from fastapi import APIRouter
from pydantic import UUID4

from app.auth.deps import AuthUser, UserOrAnon
from app.deps import ChallengeServiceDep, DbSession

from .schemas import ChallengeNotif

router = APIRouter(prefix="/challenge", tags=["challenge"])


@router.get("/", response_model=list[ChallengeNotif])
async def list_challenge(
    chall: ChallengeServiceDep,
    user: AuthUser,
    session: DbSession,
):
    await chall.list(session, user.id)


@router.post("{challenge_id}/accept")
async def accept_challenge(
    chall: ChallengeServiceDep,
    user: UserOrAnon,
    session: DbSession,
    challenge_id: UUID4,
):
    user_id = user.id if user else None
    await chall.accept(session, user_id, challenge_id)


@router.post("{target_id}/reject")
async def reject_challenge(
    chall: ChallengeServiceDep,
    user: AuthUser,
    session: DbSession,
    target_id: UUID4,
):
    await chall.reject(session, user.id, target_id)


@router.post("{challenge_id}/cancel")
async def cancel_challenge(
    chall: ChallengeServiceDep,
    user: UserOrAnon,
    session: DbSession,
    challenge_id: str,
):
    await chall.delete(session, user, challenge_id)
