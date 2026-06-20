import asyncio
import logging
from contextlib import suppress

from redis.asyncio import Redis

from ravioli_core.serializers import json

logger = logging.getLogger(__name__)


class Publisher:
    def __init__(self, redis: Redis):
        self._redis = redis
        self._queue: asyncio.Queue[tuple[str, bytes]] = asyncio.Queue()

    async def publish(self, chan: str, msg: object):
        await self._queue.put((chan, json.encode(msg)))

    async def _run(self, max_batch=50):
        while True:
            try:
                chan, payload = await self._queue.get()
                async with self._redis.pipeline() as pipe:
                    pipe.publish(chan, payload)
                    for _ in range(max_batch - 1):
                        try:
                            chan, payload = self._queue.get_nowait()
                            pipe.publish(chan, payload)
                        except asyncio.QueueEmpty:
                            break
                    await pipe.execute()
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("error in publisher task")

    def start(self):
        self._task = asyncio.create_task(self._run())

    async def stop(self):
        if not self._task.done():
            self._task.cancel()
            with suppress(asyncio.CancelledError):
                await self._task
