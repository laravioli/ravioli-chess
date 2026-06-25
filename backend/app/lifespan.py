import asyncio
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI

from app.config import settings
from app.env import ServerEnv, WsEnv, make_env


async def on_start(env: ServerEnv, ws_env: WsEnv):
    redis = env.redis
    scheduler = env.scheduler

    @scheduler.periodic(10, duration=1)
    async def heartbeat():
        await redis.hsetex("app:node", settings.NODE_ID, "alive", ex=30)  # type: ignore

    await redis.ping()  # type: ignore
    await ws_env.broadcast.start()
    scheduler.start()


async def on_stop(env: ServerEnv, ws_env: WsEnv):
    await env.scheduler.shutdown()
    await ws_env.broadcast.stop()
    with suppress(Exception):
        await env.redis.hdel("app:node", settings.NODE_ID)  # type: ignore
    await asyncio.gather(env.redis.aclose(), env.engine.dispose(), return_exceptions=True)


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    try:
        env, ws_env = make_env()

        await on_start(env, ws_env)

        yield {"http_env": env, "ws_env": ws_env}

    finally:
        # at this point websockets are closed
        await on_stop(env, ws_env)
