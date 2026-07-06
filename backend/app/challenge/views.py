from fastapi import APIRouter
from pydantic import UUID4

from app.auth.deps import AuthUser, UserOrAnon
from app.deps import DbSession
from app.env import Env

from .schemas import ChallengeNotif


def create_challenge_api_router(env: Env):
    router = APIRouter(prefix="/challenge", tags=["challenge"])

    @router.get("/", response_model=list[ChallengeNotif])
    async def list_challenge(
        user: AuthUser,
        session: DbSession,
    ):
        await env.challenge.list(session, user.id)

    @router.post("{challenge_id}/accept")
    async def accept_challenge(
        user: UserOrAnon,
        session: DbSession,
        challenge_id: UUID4,
    ):
        user_id = user.id if user else None
        await env.challenge.accept(session, user_id, challenge_id)

    @router.post("{target_id}/reject")
    async def reject_challenge(
        user: AuthUser,
        session: DbSession,
        target_id: UUID4,
    ):
        await env.challenge.reject(session, user.id, target_id)

    @router.post("{challenge_id}/cancel")
    async def cancel_challenge(
        user: UserOrAnon,
        session: DbSession,
        challenge_id: str,
    ):
        await env.challenge.delete(session, user, challenge_id)

    return router
