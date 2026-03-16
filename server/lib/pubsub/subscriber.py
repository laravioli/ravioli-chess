import asyncio
from collections.abc import AsyncGenerator

from lib.serializers import msgpack


class Subscriber:
    def __init__(self, maxsize=100):
        self._queue: asyncio.Queue[bytes] = asyncio.Queue(maxsize=maxsize)

    def put_nowait(self, item: bytes | None) -> bool:
        """Put an item in the subscriber's stream without waiting"""
        try:
            self._queue.put_nowait(item)
            return True
        except asyncio.QueueFull:
            return False

    async def iter_message[T](self, type: T) -> AsyncGenerator[T]:
        while True:
            try:
                message = await self._queue.get()
                yield msgpack.decode(message, type=type)
            except asyncio.QueueShutDown:
                break

    def shutdown(self, immediate=False):
        self._queue.shutdown(immediate=immediate)
