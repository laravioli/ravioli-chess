from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.auth.deps import wire_auth_dep
from app.config import settings
from ravioli_core.config import DbSettings, RedisSettings

from .env import Env
from .routes import add_routes


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    try:
        async with Env.lifespan(
            settings={"db": DbSettings(), "redis": RedisSettings()},  # type: ignore
            node_id=settings.NODE_ID,
        ) as env:
            add_routes(app, env)
            yield {"env": env, **wire_auth_dep(env.auth, env.user.user_repo)}
    finally:
        # at this point websockets are closed
        pass
