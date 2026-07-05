from dataclasses import dataclass

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from ravioli_core.config import DbSettings
from ravioli_core.db.utils import create_engine_and_sessionmaker
from ravioli_core.ipc.utils import create_async_redis
from ravioli_core.pubsub.publisher import Publisher
from ravioli_core.scheduler import Scheduler


@dataclass(slots=True, frozen=True)
class CoreEnv:
    redis: Redis
    pub: Publisher
    engine: AsyncEngine
    session_maker: async_sessionmaker[AsyncSession]
    scheduler: Scheduler

    @staticmethod
    def make():
        redis = create_async_redis()
        pub = Publisher(redis)
        scheduler = Scheduler()
        engine, session_maker = create_engine_and_sessionmaker(settings=DbSettings())  # type: ignore
        return CoreEnv(redis, pub, engine, session_maker, scheduler)
