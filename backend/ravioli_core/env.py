from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import TypedDict

from piccolo.engine import engine_finder
from piccolo.engine.postgres import PostgresEngine
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
    _db_engine: PostgresEngine

    @staticmethod
    def make(*, settings: CoreEnvSettings):
        redis = create_async_redis(settings["redis"])
        pub = Publisher(redis)
        engine = create_engine(settings["db"])
        session_maker = create_sessionmaker(engine)
        scheduler = Scheduler()

        db_engine = engine_finder()
        if not isinstance(db_engine, PostgresEngine):
            raise RuntimeError("Couldn't find PostgreSQL engine")

        return CoreEnv(redis, pub, engine, session_maker, scheduler, db_engine)

    @asynccontextmanager
    async def lifespan(self):

        await self._db_engine.start_connection_pool(max_size=30)
        yield
        await self._db_engine.close_connection_pool()
