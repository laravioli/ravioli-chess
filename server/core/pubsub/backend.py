import asyncio
from collections.abc import AsyncGenerator
from typing import Protocol

from redis.asyncio import Redis


class ChannelBackend(Protocol):
    async def publish(self, channel: str, message: bytes) -> None: ...
    async def subscribe(self, *args, **kwargs) -> None: ...
    async def unsubscribe(self, *args, **kwargs) -> None: ...
    async def stream(self) -> AsyncGenerator[tuple[str, bytes]]: ...
    async def stop(self) -> None: ...


class RedisBackend(ChannelBackend):
    def __init__(self, redis: Redis):
        self._redis = redis
        self._pubsub = redis.pubsub(ignore_subscribe_messages=True)

    async def publish(self, channel: str, message: bytes):
        await self._redis.publish(channel, message)

    async def subscribe(self, *args, **kwargs):
        await self._pubsub.subscribe(*args, **kwargs)

    async def unsubscribe(self, *args):
        await self._pubsub.unsubscribe(*args)

    async def stream(self):
        async for message in self._pubsub.listen():
            channel: bytes = message["channel"]
            yield channel.decode(), message["data"]

    async def stop(self):
        await asyncio.shield(self._pubsub.aclose())
