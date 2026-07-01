from fastapi import APIRouter

from app.api.schemas import Redirect
from app.auth.deps import UserOrAnon
from app.challenge.schemas import ChallengeRequest
from app.deps import DbSession
from app.process.deps import ChallengeDep

from .deps import MatchableUsers

router = APIRouter(prefix="/mm", tags=["matchmaking"])


@router.post("/ai")
async def match_ai(current_user: UserOrAnon, level: int):
    pass


@router.post("/random")
async def match_random(current_user: UserOrAnon):
    pass


@router.post("/friend", response_model=Redirect)
async def match_friend(
    session: DbSession,
    challenge: ChallengeDep,
    data: ChallengeRequest,
    pair: MatchableUsers,
):
    chall = await challenge.create(session, data, pair.sender, pair.receiver)
    if pair.sender and pair.receiver:
        # send a notif with background
        pass

    return Redirect(redirect=f"chall/{chall.challenge_id}")
