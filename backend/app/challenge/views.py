from fastapi import APIRouter
from pydantic import UUID4

from app.auth.deps import AuthUser, UserOrAnon
from app.deps import DBConnection
from app.env import Env

from .schemas import ChallengeNotif


def challenge_router(env: Env):
    router = APIRouter(prefix="/challenge", tags=["challenge"])

    @router.get("/", response_model=list[ChallengeNotif])
    async def list_challenge(
        user: AuthUser,
        conn: DBConnection,
    ):
        return await env.challenge.list(conn, user.id)

    @router.post("{challenge_id}/accept")
    async def accept_challenge(
        user: UserOrAnon,
        conn: DBConnection,
        challenge_id: UUID4,
    ):
        user_id = user.id if user else None
        await env.challenge.accept(conn, user_id, challenge_id)

    @router.post("{target_id}/reject")
    async def reject_challenge(
        user: AuthUser,
        conn: DBConnection,
        target_id: UUID4,
    ):
        await env.challenge.reject(conn, user.id, target_id)

    @router.post("{challenge_id}/cancel")
    async def cancel_challenge(
        user: UserOrAnon,
        conn: DBConnection,
        challenge_id: str,
    ):
        await env.challenge.delete(conn, user, challenge_id)

    return router
