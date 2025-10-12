import asyncio
import redis.asyncio as redis
from abc import ABC, abstractmethod


class BackgroundListener:
    """pubsub for process communication"""

    def __init__(self, *, layer: redis.Redis):
        self._pubsub = layer.pubsub(ignore_subscribe_messages=True)
        self._channels = {}

    def subscribe(self, channels: dict[str, callable]):
        self._channels.update(channels)

    def start(self):
        self._task = asyncio.create_task(self.run())

    async def run(self):
        p = self._pubsub
        async with p:
            await p.subscribe(**self._channels)
            async for _ in p.listen():
                pass

    async def stop(self):
        self._task.cancel()
        try:
            await self._task
        except asyncio.CancelledError:
            pass
        finally:
            await self._pubsub.aclose()


class BackgroundSubscriber(ABC):
    """interface for subscribing to pubsub channel"""

    @property
    @abstractmethod
    def channel(self): ...

    @abstractmethod
    async def handler(self, message): ...
