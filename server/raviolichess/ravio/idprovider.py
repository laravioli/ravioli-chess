import asyncio
from functools import cached_property
from redis.exceptions import LockError, RedisError
from raviolichess.ipc.channels import Channel
from .background import BackgroundSubscriber


class SequencerMixin:
    """get item one by one and generate them in batch"""

    async def one(self):
        async with self._lock:
            item = await self._get()
            if not item:
                item = await self._generate()
            return item


class ChanId(Channel):
    """

    args:
        chan (str): kind of ids generated.
    """

    name = "ids"


class AsyncIdProvider(SequencerMixin, BackgroundSubscriber[ChanId]):
    """Provide id pulled from a cache backend, ensuring integrity across processes.
    Use pubsub to synchronise refill"""

    def __init__(self, *, name, layer, generator, batch: int = 2048):
        self.name: str = name
        self._layer = layer
        self._skey = f"set:ids:{name}"
        self._batch = batch
        self._generator = generator
        self._lock = asyncio.Lock()
        self._event = asyncio.Event()

    @cached_property
    def channel(self) -> Channel:
        return ChanId(self.name)

    async def _get(self):
        item = await self._layer.spop(self._skey)
        return item.decode() if item else None

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
                            await pipe.publish(self.channel, "")
                            (
                                _,
                                item,
                                _,
                            ) = await pipe.execute()
                    return item.decode()

            except LockError:
                try:
                    await asyncio.wait_for(self._event.wait(), timeout=2.1)
                    return await self._get()
                except asyncio.TimeoutError:
                    continue

    async def on_message(self, _):
        """called by Notifier when another process publish to related chan"""
        self._event.set()
        self._event.clear()
