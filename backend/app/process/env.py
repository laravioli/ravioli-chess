import asyncio
from dataclasses import dataclass

from app.challenge.service import ChallengeService
from ravioli_core.env import CoreEnv, CoreEnvSettings

from .matchmaking.service import MatchMakingService


@dataclass(slots=True, frozen=True)
class Env:
    core: CoreEnv
    challenge: ChallengeService
    matchmaking: MatchMakingService

    @staticmethod
    async def make(*, settings: CoreEnvSettings):
        core = await CoreEnv.make(settings=settings)
        challenge = ChallengeService.make(redis=core.redis)
        matchmaking = MatchMakingService.make(challenge=challenge)
        return Env(core=core, challenge=challenge, matchmaking=matchmaking)

    async def on_start(self):
        await self.core.redis.ping()  # type: ignore
        self.core.scheduler.start()

    async def on_stop(self):
        await self.core.scheduler.shutdown()
        await asyncio.gather(
            self.core.redis.aclose(),
            self.core.engine.dispose(),
            self.core.pg_pool.close(),
            return_exceptions=True,
        )
