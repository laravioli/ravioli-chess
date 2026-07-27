# type: ignore

from ravioli_core.cache import RedisCache
from ravioli_core.db.types import PGConnection


class NotifCache(RedisCache[int, [PGConnection]]):
    async def _get(self, key: str):
        return await self._redis.fcall("notif_get", 1, key)

    async def _set(self, key: str, data: str | bytes, **kwargs):
        return await self._redis.fcall("notif_set", 1, key, data)

    async def incrby(self, key: str, incr: int):
        await self._redis.fcall("notif_incrby", 1, self._key_builder(key), incr)

    async def incrby_many(self, increments: dict[str, int]):
        keys = [self._key_builder(key) for key in increments.keys()]
        await self._redis.fcall("notif_incrby", len(keys), *keys, *increments.values())
