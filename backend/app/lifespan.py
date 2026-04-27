from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.deps import global_env


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001

    try:
        await global_env.start()
        yield
    finally:
        await global_env.stop()
