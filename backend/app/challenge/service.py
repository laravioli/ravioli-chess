from uuid import UUID

from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.game.db import id8
from ravioli_core.cache import CacheLib
from ravioli_core.db.enums import ChessColor
from ravioli_core.db.models import Challenge, User
from ravioli_core.db.utils import transaction

from .schemas import ChallengeRequest


class ChallengeService:
    def __init__(self, cache: CacheLib[int]):
        self._cache = cache

    async def list(
        self,
        session: AsyncSession,
        user_id: UUID,
    ):
        return await session.execute(
            select(Challenge)
            .where((Challenge.sender_id == user_id) | (Challenge.receiver_id == user_id))
            .order_by(Challenge.pub_date.desc())
        )

    async def create(
        self,
        session: AsyncSession,
        data: ChallengeRequest,
        user: User | None,
        target: UUID | None,
    ):
        async with transaction(session, error_detail="unable to create challenge"):
            challenge_id = id8()
            challenge = Challenge(
                challenge_id=challenge_id,
                sender_id=user.id if user else None,
                receiver_id=target,
                color_choice=data.color_choice,
                color=ChessColor.from_choice(data.color_choice),
                time_control=data.time_control,
            )
            session.add(challenge)

        return challenge

    async def accept(
        self,
        session: AsyncSession,
        user_id: UUID | None,
        challenge_id: UUID,
    ):
        pass

    async def reject(
        self,
        session: AsyncSession,
        user_id: UUID,
        sender_id: UUID,
    ):
        pass

    async def delete(
        self,
        session: AsyncSession,
        user: User | None,
        challenge_id: str,
    ):
        pass

    @staticmethod
    def make(*, redis: Redis):
        return ChallengeService(
            cache=CacheLib(
                redis=redis,
                namespace="challenge",
                version="v1",
                data_type=int,
            )
        )
