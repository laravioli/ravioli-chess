import asyncio
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI

from ravioli_core.env import CoreEnv

from .env import Env


async def on_start(core_env: CoreEnv):
    redis = core_env.redis
    scheduler = core_env.scheduler

    @scheduler.periodic(10, duration=1)
    async def heartbeat():
        await redis.hsetex("app:node", "coordinator", "alive", ex=30)  # type: ignore

    await redis.ping()  # type: ignore
    scheduler.start()


async def on_stop(core_env: CoreEnv):
    await core_env.scheduler.shutdown()
    with suppress(Exception):
        await core_env.redis.hdel("app:node", "coordinator")  # type: ignore
    await asyncio.gather(core_env.redis.aclose(), core_env.engine.dispose(), return_exceptions=True)


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    try:
        core_env = CoreEnv.make()
        env = Env.make()
        await on_start(core_env)
        yield {"core_env": core_env, "coord_env": env}
    finally:
        await on_stop(core_env)
