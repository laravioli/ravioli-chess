import asyncio
from typing import Annotated

from fastapi import Depends
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.websocket.broadcast import make_topics
from ravioli_core.config import DbSettings, RedisSettings
from ravioli_core.pubsub import Broadcast
from ravioli_core.utils import (
    create_async_redis,
    create_engine_and_sessionmaker,
)

# ╔══════════════════════════════════════╗
# ║   DATABASE                           ║
# ╚══════════════════════════════════════╝


engine, LocalSession = create_engine_and_sessionmaker(settings=DbSettings())


async def get_connection():
    async with engine.connect() as conn:
        yield conn


type DbConnection = Annotated[AsyncSession, Depends(get_connection, scope="function")]


async def get_session():
    async with LocalSession() as session:
        yield session


type DbSession = Annotated[AsyncSession, Depends(get_session, scope="function")]


# NOTE : session identity map doesn't update already populated object if you double select.
# NOTE to force update => u2 = session.scalars(select(User).where(User.id == 5).execution_options(populate_existing=True)).one()


# ╔══════════════════════════════════════╗
# ║   REDIS                              ║
# ╚══════════════════════════════════════╝


redis = create_async_redis(settings=RedisSettings())


async def get_redis() -> Redis:
    return redis


type RedisClient = Annotated[Redis, Depends(get_redis)]

# ╔══════════════════════════════════════╗
# ║   BROADCAST                          ║
# ╚══════════════════════════════════════╝


broadcast = Broadcast(redis=redis, topics=make_topics)


async def get_broadcast() -> Broadcast:
    return broadcast


type BroadCastClient = Annotated[Broadcast, Depends(get_broadcast)]


# ╔══════════════════════════════════════╗
# ║   ENV                                ║
# ╚══════════════════════════════════════╝


class Env:
    __slots__ = (
        "engine",
        "redis",
        "broadcast",
    )

    def __init__(self, engine: AsyncEngine, redis: Redis, broadcast: Broadcast):
        self.engine = engine
        self.redis = redis
        self.broadcast = broadcast

    async def start(self):
        await broadcast.start()

    async def stop(self):
        await asyncio.gather(broadcast.stop(), engine.dispose())
        await redis.aclose()


GLOBAL_ENV = Env(engine=engine, redis=redis, broadcast=broadcast)


async def get_env():
    return GLOBAL_ENV


type EnvDep = Annotated[Env, Depends(get_env)]
