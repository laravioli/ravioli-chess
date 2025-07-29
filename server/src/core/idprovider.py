import asyncio
import redis.asyncio as redis
from redis.exceptions import LockError
import functools


class AsyncIdProvider:
    """Class that generate batch of ids and provide them one by one in a distribued way"""

    def __init__(self, name, id_generator, *, layer: redis.Redis, batch: int):
        self.layer = layer
        self.key = f"ids:{name}"
        self.channel = f"channel-ids-{name}"
        self.event = asyncio.Event()
        self.id_generator = functools.partial(id_generator, batch=batch)

    async def get_one(self):
        id = await self.try_one()
        if not id:
            id = await self.refill_or_wait()
        return id

    async def try_one(self):
        return await self.layer.spop(self.key)

    async def refill_or_wait(self):
        try:
            id = await self.refill()
        except LockError:
            await self.event.wait()
            id = await self.try_one()
        return id or await self.refill_or_wait()

    async def refill(self):
        async with self.layer.lock(f"refill-{self.key}", blocking=False, timeout=2):
            ids = await self.id_generator(self.layer)
            async with self.layer.pipeline() as pipe:
                await pipe.sadd(self.key, *ids)
                await pipe.spop(self.key)
                await pipe.publish(self.channel, "")
                (
                    _,
                    id,
                    _,
                ) = await pipe.execute()
            return id

    async def ps_handler(self, _):
        """pubsub callback, trigger asyncio.Event when a process refill the pool of ids"""
        self.event.set()
        self.event.clear()
