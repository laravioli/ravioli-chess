from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.challenge.schemas import ChallengeRequest
from app.challenge.service import ChallengeService
from app.game.db import id8
from ravioli_core.db.enums import ChessColor
from ravioli_core.db.models import Challenge, User
from ravioli_core.utils import transaction


class MatchMakingService:
    def __init__(self, challenge: ChallengeService):
        self.challenge = challenge

    async def ai(self):
        pass

    async def friend(
        self,
        session: AsyncSession,
        request: ChallengeRequest,
        user: User | None,
        target: UUID | None,
    ):
        async with transaction(session, error_detail="unable to create challenge"):
            challenge_id = id8()
            challenge = Challenge(
                challenge_id=challenge_id,
                sender_id=user,
                receiver_id=target,
                color_choice=request.color_choice,
                color=ChessColor.from_choice(request.color_choice),
                time_control=request.time_control,
            )
            session.add(challenge)

        return challenge

    async def random(self):
        pass


def make_mm_service(challenge: ChallengeService):
    return MatchMakingService(challenge=challenge)
