import asyncio
from .pubsub import BackgroundSubscriber
from redis.exceptions import LockError, RedisError


class SequencerMixin:
    """get item one by one and generate them in batch"""

    async def one(self):
        async with self._lock:
            item = await self._get()
            if not item:
                item = await self._generate(batch=self.batch)
            return item


class AsyncIdProvider(SequencerMixin, BackgroundSubscriber):
    """Provide id pulled from a cache backend.
    Use pubsub to synchronise processes"""

    def __init__(
        self,
        *,
        name,
        generator,
        layer,
        batch: int = 512,
    ):
        self.name = name
        self._key = f"ids:{name}"
        self._layer = layer
        self._lock = asyncio.Lock()
        self._event = asyncio.Event()
        self._generator = generator
        self.batch = batch

    async def _get(self):
        return await self._layer.spop(self._key)

    async def _generate(self, batch):
        while True:
            try:
                async with self._layer.lock(
                    f"generate-{self._key}", blocking=False, timeout=2
                ):
                    # double-check to prevent stale assumption
                    item = await self._get()
                    if not item:
                        ids = await self._generator(batch=batch)
                        async with self._layer.pipeline() as pipe:
                            await pipe.sadd(self._key, *ids)
                            await pipe.spop(self._key)
                            await pipe.publish(self.channel, "")
                            (
                                _,
                                item,
                                _,
                            ) = await pipe.execute()
                    return item

            except LockError:
                try:
                    await asyncio.wait_for(self._event.wait(), timeout=2.1)
                    return await self._get()
                except asyncio.TimeoutError:
                    continue

            except RedisError:
                raise

    # Subscribe
    @property
    def channel(self):
        return f"channel-ids-{self.name}"

    async def handler(self, _):
        """called by Notifier when another process has generate new ids"""
        self._event.set()
        self._event.clear()
