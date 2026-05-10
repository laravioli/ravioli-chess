from ravioli_core.cache import CacheLib
from ravioli_core.cache.utils import KeyParams


class NotifCache(CacheLib[int]):
    async def _get(self, key: str, **kwargs):
        return await self.redis.fcall("notif_get", 1, key, self.ttl(self.default_ttl))

    async def _set(self, key: str, data: str | bytes, **kwargs):
        return await self.redis.fcall("notif_set", 1, key, data, self.ttl(self.default_ttl))

    async def incrby(self, id: str, incr: int, params: KeyParams = None):
        key = self.cache_key.build(id, params)
        await self.redis.fcall("notif_incrby", 1, key, incr)
