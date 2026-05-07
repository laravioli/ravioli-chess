from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.deps import GLOBAL_ENV


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001

    try:
        await GLOBAL_ENV.start()
        yield
    finally:
        await GLOBAL_ENV.stop()
