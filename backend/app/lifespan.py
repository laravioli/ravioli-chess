import asyncio
from contextlib import asynccontextmanager
from dataclasses import dataclass

from fastapi import FastAPI
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from app.config import settings
from app.services import Services
from app.websocket.env import WsEnv
from app.websocket.handlers import make_topics
from app.websocket.users import Users
from ravioli_core.config import DbSettings, RedisSettings
from ravioli_core.pubsub import Broadcast
from ravioli_core.scheduler import Scheduler
from ravioli_core.utils import (
    create_async_redis,
    create_engine_and_sessionmaker,
)


@dataclass(slots=True, frozen=True)
class ServerEnv:
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

    return ServerEnv(redis, broadcast, engine, session_maker, services, scheduler)


def make_ws_env(env: ServerEnv) -> WsEnv:
    users = Users(redis=env.redis, scheduler=env.scheduler)

    return WsEnv(env.broadcast, env.engine, env.services.notif, users)


async def on_start(env: ServerEnv, ws_env: WsEnv):
    redis = env.redis
    scheduler = env.scheduler
    users = ws_env.users

    @scheduler.periodic(10, duration=1)
    async def heartbeat():
        async with redis.pipeline() as pipe:
            pipe.set(settings.WORKER_ID, "alive", ex=30)
            pipe.expire(users.presence_key, 30)
            await pipe.execute()

    await redis.ping()
    await redis.sadd(users.presence_key, "elravioli")
    await env.broadcast.start()
    scheduler.start()


async def on_stop(env: ServerEnv, ws_env: WsEnv):
    await env.scheduler.shutdown()
    await asyncio.gather(env.broadcast.stop(), env.engine.dispose())
    async with env.redis.pipeline() as pipe:
        pipe.delete(ws_env.users.presence_key)
        pipe.delete(settings.WORKER_ID)
        await pipe.execute()
    await env.redis.aclose()


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    try:
        env = make_env()
        ws_env = make_ws_env(env)

        await on_start(env, ws_env)

        yield {"http_env": env, "ws_env": ws_env}

    finally:
        await on_stop(env, ws_env)
