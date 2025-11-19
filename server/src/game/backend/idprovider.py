import asyncio
from .channels import ChanId
from .background import BackgroundSubscriber
from functools import cached_property
from redis.exceptions import LockError, RedisError


class SequencerMixin:
    """get item one by one and generate them in batch"""

    async def one(self):
        async with self._lock:
            item = await self._get()
            if not item:
                item = await self._generate()
            return item


class AsyncIdProvider(SequencerMixin, BackgroundSubscriber[ChanId]):
    """Provide id pulled from a cache backend.
    Use pubsub to synchronise processes"""

    def __init__(self, *, name, layer, generator, batch: int = 512):
        self.name: str = name
        self._layer = layer
        self._skey = f"ids:{name}"
        self._batch = batch
        self._generator = generator
        self._lock = asyncio.Lock()
        self._event = asyncio.Event()

    @cached_property
    def channel(self):
        return ChanId(self.name)

    async def _get(self):
        return await self._layer.spop(self._skey)

    async def _generate(self):
        while True:
            try:
                async with self._layer.lock(
                    f"generate-{self._skey}", blocking=False, timeout=2
                ):
                    # double-check to prevent stale assumption
                    item = await self._get()
                    if not item:
                        ids = await self._generator(batch=self._batch)
                        async with self._layer.pipeline() as pipe:
                            await pipe.sadd(self._skey, *ids)
                            await pipe.spop(self._skey)
                            await pipe.publish(self.channel.chan, "")
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

    async def on_message(self, _):
        """called by Notifier when another process publish to related chan"""
        self._event.set()
        self._event.clear()
