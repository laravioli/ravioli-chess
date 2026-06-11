from collections.abc import Iterable

from redis.asyncio import Redis

from .types import Chan, MsgHandler
from .utils import str_if_bytes


class Connection:
    """
    wrapper around redis pubsub object
    """

    def __init__(self, chans: list[Chan], redis: Redis):
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
        # "chan:all" channel so conn.listen keeps running
        await pubsub.subscribe(*self.chans)
        try:
            while True:
                async for msg in pubsub.listen():
                    channel = str_if_bytes(msg["channel"])
                    if channel not in pubsub.pending_unsubscribe_channels:
                        handle(channel, msg["data"])
        finally:
            await pubsub.aclose()

    # NOTE using this concurrently "may" alter connection state (like retry)
    # NOTE but not packet sent
    async def subscribe(self, chans: Iterable[Chan]):
        await self._pubsub.subscribe(*chans)

    async def unsubscribe(self, chans: Iterable[Chan]):
        await self._pubsub.unsubscribe(*chans)
