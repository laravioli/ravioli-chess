from typing import Annotated

from fastapi import Depends, Request
from redis.asyncio import Redis


async def get_redis(request: Request) -> Redis:
    return request.state.redis


RedisClient = Annotated[Redis, Depends(get_redis)]
