from contextlib import asynccontextmanager

from fastapi import FastAPI
from redis.asyncio import Redis

from app.config import settings
from app.deps import engine
from core.pubsub import Broadcast, RedisBackend


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    redis = Redis.from_url(settings.REDIS_URL, health_check_interval=15)
    broadcast = Broadcast(backend=RedisBackend(redis))
    try:
        await broadcast.start()
        yield {"redis": redis, "broadcast": broadcast}
    finally:
        await broadcast.stop()
        await redis.aclose()
        await engine.dispose()
