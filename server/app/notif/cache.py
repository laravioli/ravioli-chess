from typing import Annotated

from fastapi import Depends

from app.deps import RedisClient
from lib.cache import CacheService

from .schemas import notification_adapter


async def get_notif_cache(redis: RedisClient):
    return CacheService(
        redis,
        namespace="notifications",
        model=notification_adapter,
        version="v1",
        default_ttl=300,
    )


type NotifCache = Annotated[CacheService, Depends(get_notif_cache)]
