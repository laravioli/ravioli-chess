from typing import Any

from redis.asyncio import Redis

from ravioli_core.config import RedisSettings


def create_async_redis(**kwargs: Any):
    settings = RedisSettings().as_dict()  # type: ignore
    settings.update(kwargs)
    return Redis(**settings)
