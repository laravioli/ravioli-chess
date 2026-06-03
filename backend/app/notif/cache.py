import asyncio
from collections.abc import Iterable
from uuid import UUID

from ravioli_core.cache import CacheLib


class NotifCache(CacheLib[int]):
    async def _get(self, key: str, **kwargs):
        return await self.redis.fcall("notif_get", 1, key)

    async def _set(self, key: str, data: str | bytes, **kwargs):
        return await self.redis.fcall("notif_set", 1, key, data)

    async def incrby(self, id: str, incr: int):
        key = self.cache_key.build(id)
        await self.redis.fcall("notif_incrby", 1, key, incr)

    async def incrby_many(self, increments: dict[str, int]):
        keys = [self.cache_key.build(key) for key in increments.keys()]
        await self.redis.fcall("notif_incrby", len(keys), *keys, *increments.values())

    async def invalidate_count(self, user_ids: Iterable[UUID]):
        coros = [self.delete(f"{user_id}") for user_id in user_ids]
        return await asyncio.gather(*coros, return_exceptions=True)
