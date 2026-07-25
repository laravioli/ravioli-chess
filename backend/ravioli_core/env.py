from dataclasses import dataclass
from typing import TypedDict

from asyncpg import Pool
from redis.asyncio import Redis

from ravioli_core.db.pool import PoolConfig, create_db_pool
from ravioli_core.ipc.redis import RedisConfig, create_async_redis
from ravioli_core.pubsub.publisher import Publisher
from ravioli_core.scheduler import Scheduler


class CoreConfig(TypedDict):
    pool: PoolConfig
    redis: RedisConfig


@dataclass(slots=True, frozen=True)
class CoreEnv:
    redis: Redis
    pg_pool: Pool
    pub: Publisher
    scheduler: Scheduler

    @staticmethod
    async def make(*, config: CoreConfig):
        redis = create_async_redis(config["redis"])
        pg_pool = await create_db_pool(config["pool"])
        pub = Publisher(redis)
        scheduler = Scheduler()

        return CoreEnv(redis, pg_pool, pub, scheduler)
