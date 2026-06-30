from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ravioli_core.db.models import Challenge, User


class ChallengeService:
    async def list_challenge(
        self,
        session: AsyncSession,
        user_id: UUID,
    ):
        return await session.execute(
            select(Challenge)
            .where((Challenge.sender_id == user_id) | (Challenge.receiver_id == user_id))
            .order_by(Challenge.pub_date.desc())
        )

    async def create_challenge(self, session: AsyncSession, user_id: UUID | None):
        pass

    async def accept_challenge(
        self,
        session: AsyncSession,
        user_id: UUID | None,
        challenge_id: UUID,
    ):
        pass

    async def reject_challenge(
        self,
        session: AsyncSession,
        user_id: UUID,
        sender_id: UUID,
    ):
        pass

    async def delete_challenge(
        self,
        session: AsyncSession,
        user: User | None,
        challenge_id: str,
    ):
        pass


def make_challenge_service():
    return ChallengeService()
