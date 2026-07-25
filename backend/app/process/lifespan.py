from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI

from ravioli_core.config import DbSettings, RedisSettings

from .env import Env
from .routes import add_routes


async def on_start(env: Env):
    redis = env.core.redis
    scheduler = env.core.scheduler

    @scheduler.periodic(10, duration=1)
    async def heartbeat():
        await redis.hsetex("app:node", "node-0", "alive", ex=30)  # type: ignore

    await env.on_start()


async def on_stop(env: Env):
    with suppress(Exception):
        await env.core.redis.hdel("app:node", "node-0")  # type: ignore
    await env.on_stop()


@asynccontextmanager
async def lifespan(app: FastAPI):
    env = await Env.make(settings={"db": DbSettings(), "redis": RedisSettings()})  # type: ignore
    try:
        await on_start(env)
        add_routes(app, env)
        yield {"env": env}
    finally:
        await on_stop(env)
