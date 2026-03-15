from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.deps import engine
from core.config import RedisSettings
from core.utils import create_async_redis
from lib.pubsub import Broadcast, RedisBackend


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    redis = create_async_redis(settings=RedisSettings())
    broadcast = Broadcast(backend=RedisBackend(redis))
    try:
        await broadcast.start()
        yield {"redis": redis, "broadcast": broadcast}
    finally:
        await broadcast.stop()
        await redis.aclose()
        await engine.dispose()
