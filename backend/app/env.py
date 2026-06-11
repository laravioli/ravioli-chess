from dataclasses import dataclass

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from app.services import Services
from ravioli_core.config import DbSettings, RedisSettings
from ravioli_core.pubsub import Publisher
from ravioli_core.scheduler import Scheduler
from ravioli_core.utils import (
    create_async_redis,
    create_engine_and_sessionmaker,
)


@dataclass(slots=True, frozen=True)
class ServerEnv:
    redis: Redis
    pub: Publisher
    engine: AsyncEngine
    session_maker: async_sessionmaker[AsyncSession]
    services: Services
    scheduler: Scheduler

    @staticmethod
    def make():

        redis = create_async_redis(settings=RedisSettings())
        pub = Publisher(redis)
        scheduler = Scheduler()
        engine, session_maker = create_engine_and_sessionmaker(settings=DbSettings())
        services = Services.make(redis)

        return ServerEnv(redis, pub, engine, session_maker, services, scheduler)
