import asyncio
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI

from .env import Env, make_env


async def on_start(env: Env):
    redis = env.redis
    scheduler = env.scheduler

    @scheduler.periodic(10, duration=1)
    async def heartbeat():
        await redis.hsetex("app:node", "matchmaking", "alive", ex=30)  # type: ignore

    await redis.ping()  # type: ignore
    scheduler.start()


async def on_stop(env: Env):
    await env.scheduler.shutdown()
    with suppress(Exception):
        await env.redis.hdel("app:node", "matchmaking")  # type: ignore
    await asyncio.gather(env.redis.aclose(), env.engine.dispose(), return_exceptions=True)


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    try:
        env = make_env()
        await on_start(env)
        yield {"env": env}
    finally:
        await on_stop(env)
