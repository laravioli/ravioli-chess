from fastapi import APIRouter

from app.api.schemas import Redirect
from app.auth.deps import UserOrAnon
from app.challenge.schemas import ChallengeRequest
from app.deps import DBConnection
from app.process.env import Env

from .deps import MatchableUsers


def create_mm_api_router(env: Env):

    router = APIRouter(prefix="/mm", tags=["matchmaking"])

    @router.post("/ai")
    async def match_ai(current_user: UserOrAnon, level: int):
        pass

    @router.post("/random")
    async def match_random(current_user: UserOrAnon):
        pass

    @router.post("/friend", response_model=Redirect)
    async def match_friend(
        conn: DBConnection,
        data: ChallengeRequest,
        pair: MatchableUsers,
    ):
        chall = await env.challenge.create(conn, data, pair.sender, pair.receiver)
        if pair.sender and pair.receiver:
            # send a notif with background
            pass

        return Redirect(redirect=f"chall/{chall.challenge_id}")

    return router
