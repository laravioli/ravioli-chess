import asyncio
import logging
from collections.abc import Iterable

from redis.asyncio import Redis
from redis.exceptions import ConnectionError, TimeoutError

from .types import Chan, MsgHandler

logger = logging.getLogger(__name__)


class Connection:
    """
    wrapper around redis pubsub object
    """

    def __init__(self, chans: list[Chan], redis: Redis):
        # NOTE conn.listen keeps running
        # NOTE behavior of listen is not the same in redis-py > 7.4
        assert len(chans) > 0
        self.chans = chans
        self._pubsub = redis.pubsub(ignore_subscribe_messages=True)
        self._handler = None

    def set_handler(self, handler: MsgHandler):
        self._handler = handler

    async def listen(self):

        pubsub = self._pubsub
        assert self._handler
        handle = self._handler
        await pubsub.subscribe(*self.chans)
        while True:
            try:
                async for msg in pubsub.listen():
                    channel = msg["channel"]
                    if channel not in pubsub.pending_unsubscribe_channels:
                        try:
                            handle(channel, msg["data"])
                        except ValueError:
                            logger.exception("channel: %s\n message: %s", channel, msg["data"])
            except (ConnectionError, TimeoutError):
                logger.exception("redis pubsub connection error")
                await asyncio.sleep(5)

    async def subscribe(self, chans: Iterable[Chan]):
        await self._pubsub.subscribe(*chans)

    async def unsubscribe(self, chans: Iterable[Chan]):
        await self._pubsub.unsubscribe(*chans)

    async def aclose(self):
        await self._pubsub.aclose()
