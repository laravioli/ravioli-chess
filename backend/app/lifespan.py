from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.deps import Env


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    try:
        env = Env()
        await env.on_start()
        yield {"env": env}
    finally:
        await env.on_stop()
