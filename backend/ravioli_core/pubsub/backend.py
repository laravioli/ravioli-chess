import asyncio

from redis.asyncio import Redis

from .types import ChannelBackend


class RedisBackend(ChannelBackend):
    __slots__ = ("_redis", "_pubsub")

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
