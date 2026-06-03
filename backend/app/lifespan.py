import asyncio
from contextlib import asynccontextmanager
from typing import TypedDict

from fastapi import FastAPI
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from app.config import settings
from app.services import Services
from app.websocket.broadcast import make_topics
from ravioli_core.config import DbSettings, RedisSettings
from ravioli_core.pubsub import Broadcast
from ravioli_core.scheduler import Scheduler
from ravioli_core.utils import (
    create_async_redis,
    create_engine_and_sessionmaker,
)


class ServerEnv(TypedDict):
    redis: Redis
    broadcast: Broadcast
    engine: AsyncEngine
    session_maker: async_sessionmaker[AsyncSession]
    services: Services
    scheduler: Scheduler


def make_env() -> ServerEnv:

    redis = create_async_redis(settings=RedisSettings())
    broadcast = Broadcast(redis=redis, topics=make_topics)
    engine, session_maker = create_engine_and_sessionmaker(settings=DbSettings())
    services = Services.make(redis)
    scheduler = Scheduler()

    return {
        "redis": redis,
        "broadcast": broadcast,
        "engine": engine,
        "session_maker": session_maker,
        "services": services,
        "scheduler": scheduler,
    }


async def on_start(env: ServerEnv):
    redis = env["redis"]
    scheduler = env["scheduler"]

    @scheduler.periodic(10, duration=1)
    async def heartbeat():
        await redis.set(settings.WORKER_ID, "alive", ex=15)

    await redis.ping()
    await env["broadcast"].start()
    scheduler.start()


async def on_stop(env: ServerEnv):
    await env["scheduler"].shutdown()
    await asyncio.gather(env["broadcast"].stop(), env["engine"].dispose())
    await env["redis"].delete(settings.WORKER_ID)
    await env["redis"].aclose()


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    try:
        env = make_env()
        await on_start(env)
        yield {"env": env}
    finally:
        await on_stop(env)
