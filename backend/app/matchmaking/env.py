from dataclasses import dataclass

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from app.challenge.service import make_challenge_service
from app.publisher import Publisher
from ravioli_core.config import DbSettings
from ravioli_core.scheduler import Scheduler
from ravioli_core.utils import (
    create_async_redis,
    create_engine_and_sessionmaker,
)

from .service import MatchMakingService, make_mm_service


@dataclass(slots=True, frozen=True)
class Env:
    redis: Redis
    pub: Publisher
    engine: AsyncEngine
    session_maker: async_sessionmaker[AsyncSession]
    matchmaking: MatchMakingService
    scheduler: Scheduler


def make_env():

    redis = create_async_redis()
    pub = Publisher(redis)
    scheduler = Scheduler()
    engine, session_maker = create_engine_and_sessionmaker(settings=DbSettings())  # type: ignore
    mm = make_mm_service(make_challenge_service())

    return Env(redis, pub, engine, session_maker, mm, scheduler)
