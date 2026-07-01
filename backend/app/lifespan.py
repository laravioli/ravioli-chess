import asyncio
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI

from app.api.env import ApiEnv
from app.config import settings
from app.websocket.env import WsEnv
from ravioli_core.env import CoreEnv


async def on_start(core_env: CoreEnv, ws_env: WsEnv):
    redis = core_env.redis
    scheduler = core_env.scheduler

    @scheduler.periodic(10, duration=1)
    async def heartbeat():
        await redis.hsetex("app:node", settings.NODE_ID, "alive", ex=30)  # type: ignore

    await redis.ping()  # type: ignore
    await ws_env.broadcast.start()
    scheduler.start()


async def on_stop(core_env: CoreEnv, ws_env: WsEnv):
    await core_env.scheduler.shutdown()
    await ws_env.broadcast.stop()
    with suppress(Exception):
        await core_env.redis.hdel("app:node", settings.NODE_ID)  # type: ignore
    await asyncio.gather(core_env.redis.aclose(), core_env.engine.dispose(), return_exceptions=True)


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    try:
        core_env = CoreEnv.make()
        api_env = ApiEnv.make(core_env.redis)
        ws_env = WsEnv.make(core_env.redis, core_env.scheduler, api_env.notif)

        await on_start(core_env, ws_env)

        yield {"core_env": core_env, "api_env": api_env, "ws_env": ws_env}

    finally:
        # at this point websockets are closed
        await on_stop(core_env, ws_env)
