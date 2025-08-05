import asyncio
from redis.exceptions import LockError


class MixinRessourceSequencer:
    """get item one by one and generate them in batch"""

    async def one(self):
        async with self._lock:
            item = await self._get()
            if not item:
                item = await self._generate(batch=self.batch)
            return item


class AsyncIdProvider(MixinRessourceSequencer):
    """Provide id pulled from an external source"""

    def __init__(
        self,
        *,
        name,
        generator,
        layer,
        batch: int = 256,
    ):
        self.channel = f"channel-ids-{name}"
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
                    ids = await self._generator(self._layer, batch=batch)
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
                await asyncio.wait_for(self._event.wait(), timeout=2.1)
                return await self._layer.spop(self._key)

            except TimeoutError:
                continue

    async def handler(self, _):
        self._event.set()
        self._event.clear()
