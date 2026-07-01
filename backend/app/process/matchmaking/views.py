from fastapi import APIRouter, HTTPException, status
from pydantic import UUID4

from app.auth.deps import UserOrAnon
from app.challenge.schemas import ChallengeRequest
from app.deps import DbSession
from app.process.deps import MatchmakingDep

router = APIRouter(prefix="/mm", tags=["matchmaking"])


@router.post("/ai")
async def match_ai(current_user: UserOrAnon, level: int):
    pass


@router.post("/random")
async def match_random(current_user: UserOrAnon):
    pass


@router.post("/{target}/friend")
async def match_friend(
    session: DbSession,
    challenge: ChallengeRequest,
    current_user: UserOrAnon,
    mm: MatchmakingDep,
    target: UUID4 | None = None,
):
    if (not current_user) and target:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="you must be connected to challenge users",
        )
    challenge_id = await mm.friend(session, challenge, current_user, target)
    if current_user and target:
        # send a notif with background
        pass

    return challenge_id
