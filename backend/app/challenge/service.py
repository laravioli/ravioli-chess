from uuid import UUID

from redis.asyncio import Redis

from app.game.db import id8
from app.user import User
from ravioli_core.cache import RedisCache
from ravioli_core.db.enums import ChessColor
from ravioli_core.db.queries import ChallQueries
from ravioli_core.db.types import PGConnection

from .schemas import ChallengeRequest
from .structs import Challenge


class ChallengeService:
    def __init__(self, cache: RedisCache):
        self._cache = cache

    async def list(
        self,
        conn: PGConnection,
        user_id: UUID,
    ):
        return await conn.fetch(ChallQueries.list, user_id)

    async def create(
        self,
        conn: PGConnection,
        data: ChallengeRequest,
        user: User | None,
        target: UUID | None,
    ):
        c = Challenge(
            challenge_id=id8(),
            sender_id=user.id if user else None,
            receiver_id=target,
            color_choice=data.color_choice,
            color=ChessColor.from_choice(data.color_choice),
            time_control=data.time_control,
        )
        await conn.execute(
            ChallQueries.create,
            c.challenge_id,
            c.sender_id,
            c.receiver_id,
            c.color_choice,
            c.color,
            c.time_control,
        )

        return c

    async def accept(
        self,
        conn: PGConnection,
        user_id: UUID | None,
        challenge_id: UUID,
    ):
        pass

    async def reject(
        self,
        conn: PGConnection,
        user_id: UUID,
        sender_id: UUID,
    ):
        pass

    async def delete(
        self,
        conn: PGConnection,
        user: User | None,
        challenge_id: str,
    ):
        pass

    @staticmethod
    def make(*, redis: Redis):
        async def build(key: str):  # noqa: ARG001
            return 42

        return ChallengeService(
            cache=RedisCache(
                redis=redis,
                name="challenge",
                version="v1",
                value_type=int,
                value_builder=build,
            )
        )
