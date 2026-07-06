from typing import Any

from redis.asyncio import Redis

from ravioli_core.config import RedisSettings


def create_async_redis(s: RedisSettings, **overrides: Any):
    settings_dict = s.as_dict()  # type: ignore
    settings_dict.update(**overrides)
    return Redis(**settings_dict)
