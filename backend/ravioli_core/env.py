from dataclasses import dataclass
from typing import TypedDict

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from ravioli_core.config import DbSettings, RedisSettings
from ravioli_core.db.utils import create_engine, create_sessionmaker
from ravioli_core.ipc.utils import create_async_redis
from ravioli_core.pubsub.publisher import Publisher
from ravioli_core.scheduler import Scheduler


class CoreEnvSettings(TypedDict):
    db: DbSettings
    redis: RedisSettings


@dataclass(slots=True, frozen=True)
class CoreEnv:
    redis: Redis
    pub: Publisher
    engine: AsyncEngine
    session_maker: async_sessionmaker[AsyncSession]
    scheduler: Scheduler

    @staticmethod
    def make(*, settings: CoreEnvSettings):
        redis = create_async_redis(settings["redis"])
        pub = Publisher(redis)
        engine = create_engine(settings["db"])
        session_maker = create_sessionmaker(engine)
        scheduler = Scheduler()
        return CoreEnv(redis, pub, engine, session_maker, scheduler)
