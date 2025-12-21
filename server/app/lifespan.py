from contextlib import asynccontextmanager

from fastapi import FastAPI
from redis.asyncio import Redis

from app.config import settings
from app.db.core import engine


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    redis = Redis.from_url(settings.REDIS_URL, health_check_interval=15)
    yield {"redis": redis}
    await redis.aclose()
    await engine.dispose()
