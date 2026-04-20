from typing import Annotated

from fastapi import Depends

from app.deps import RedisClient
from lib.cache import CacheLib

from .schemas import notification_adapter


async def get_notif_cache(redis: RedisClient):
    return CacheLib(
        redis,
        namespace="notifications",
        data_out=bytes,
        converter=notification_adapter,
        version="v1",
        default_ttl=300,
    )


type NotifCache = Annotated[CacheLib, Depends(get_notif_cache)]
