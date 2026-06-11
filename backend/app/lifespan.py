import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.env import ServerEnv
from app.websocket.env import WsEnv


async def on_start(env: ServerEnv, ws_env: WsEnv):
    redis = env.redis
    scheduler = env.scheduler
    users = ws_env.users

    @scheduler.periodic(10, duration=1)
    async def heartbeat():
        async with redis.pipeline() as pipe:
            pipe.hsetex("app:node", settings.NODE_ID, "alive", ex=30)
            pipe.expire(users.presence_key, 30)
            await pipe.execute()

    await redis.ping()
    await redis.sadd(users.presence_key, "raviolichess")
    await ws_env.broadcast.start()
    scheduler.start()


async def on_stop(env: ServerEnv, ws_env: WsEnv):
    await env.scheduler.shutdown()
    await asyncio.gather(ws_env.broadcast.stop(), env.engine.dispose())
    async with env.redis.pipeline() as pipe:
        pipe.delete(ws_env.users.presence_key)
        pipe.hdel("app:node", settings.NODE_ID)
        await pipe.execute()
    await env.redis.aclose()


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    try:
        env: ServerEnv = ServerEnv.make()
        ws_env: WsEnv = WsEnv.make(env)

        await on_start(env, ws_env)

        yield {"http_env": env, "ws_env": ws_env}

    finally:
        # at this point websockets are closed
        await on_stop(env, ws_env)
