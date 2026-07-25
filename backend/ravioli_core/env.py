from dataclasses import dataclass
from typing import TypedDict

from asyncpg import Pool
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from ravioli_core.config import DbSettings, RedisSettings
from ravioli_core.db.utils import create_engine, create_sessionmaker, init_db_pool
from ravioli_core.ipc.utils import create_async_redis
from ravioli_core.pubsub.publisher import Publisher
from ravioli_core.scheduler import Scheduler


class CoreEnvSettings(TypedDict):
    db: DbSettings
    redis: RedisSettings


@dataclass(slots=True, frozen=True)
class CoreEnv:
    redis: Redis
    pg_pool: Pool
    pub: Publisher
    engine: AsyncEngine
    session_maker: async_sessionmaker[AsyncSession]
    scheduler: Scheduler

    @staticmethod
    async def make(*, settings: CoreEnvSettings):
        redis = create_async_redis(settings["redis"])
        pg_pool = await init_db_pool()  # add settings here
        pub = Publisher(redis)
        engine = create_engine(settings["db"])
        session_maker = create_sessionmaker(engine)
        scheduler = Scheduler()

        return CoreEnv(redis, pg_pool, pub, engine, session_maker, scheduler)
