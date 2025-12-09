import asyncio
import logging
from redis.asyncio import Redis
from redis.asyncio.client import PubSub
from .manager import Manager

logger = logging.getLogger(__name__)


class PubSubManager(Manager):
    """pubsub for process communication"""

    def __init__(self, *, layer: Redis, subscriptions: dict):
        self._pubsub: PubSub = layer.pubsub(ignore_subscribe_messages=True)
        self._subscriptions = subscriptions
        self._lock = asyncio.Lock()
        self._close_signal = asyncio.Event()

    # todo: make run more robust to error
    async def run(self):
        try:
            p = self._pubsub
            async with p:
                await p.subscribe(**self._subscriptions)
                async for _ in p.listen():
                    pass
        finally:
            await self.stop()

    async def stop(self):
        self._close_signal.set()
        await self._pubsub.aclose()

    async def subscribe(self, channel_with_callback):
        if not self._close_signal.is_set():
            async with self._lock:
                await self._pubsub.subscribe(**channel_with_callback)

    async def unsubscribe(self, channel):
        if not self._close_signal.is_set():
            async with self._lock:
                await self._pubsub.unsubscribe(channel)
