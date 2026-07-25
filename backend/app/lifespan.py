from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from ravioli_core.db.pool import PoolConfig
from ravioli_core.ipc.redis import RedisConfig

from .env import Env
from .routes import add_routes


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    try:
        async with Env.lifespan(
            config={"pool": PoolConfig(), "redis": RedisConfig()},  # type: ignore
            node_id=settings.NODE_ID,
        ) as env:
            add_routes(app, env)
            yield {"env": env}
    finally:
        # at this point websockets are closed
        pass
