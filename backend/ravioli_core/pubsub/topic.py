from collections.abc import Callable
from dataclasses import dataclass

from redis.asyncio import Redis
from redis.client import PubSub

from ravioli_core.serializers import json

from .bus import EventBus
from .subscriber import Subscriber
from .utils import LazyEvent

type ChanStr = str
type MsgStr = str


@dataclass(frozen=True)
class Deps:
    bus: EventBus
    handler: Callable[[EventBus, ChanStr, MsgStr], None]
    message_types: type


class Topic:
    def __init__(self, name: str, deps: Deps):
        self.name = name
        self._has_sub = LazyEvent()
        self._deps = deps
        self._bus = deps.bus
        self._conn: PubSub | None = None

    async def subscribe(self, sub: Subscriber, chans: list[str]):
        new_chans = self._bus.subscribe(sub, chans)
        if len(new_chans) > 0:
            await self._conn.subscribe(*new_chans)
            if not self._has_sub.is_set():
                self._has_sub.set()

    async def unsubscribe(self, sub: Subscriber, chans: list[str]):
        old_chans = self._bus.unsubcribe(sub, chans)
        if len(old_chans) > 0:
            await self._conn.unsubscribe(*old_chans)

    async def run(self, redis: Redis):

        conn = self._conn = redis.pubsub(ignore_subscribe_messages=True)
        handle = self._deps.handler
        bus = self._bus
        message_types = self._deps.message_types
        try:
            while True:
                await self._has_sub.wait()
                async for msg in conn.listen():
                    chan = msg["channel"].decode()
                    data = json.decode(msg["data"], type_arg=message_types)
                    handle(bus, chan, data)
                # NOTE this code rely on current listen behavior redis-py 7.4.0
                self._has_sub.clear()
        finally:
            await conn.aclose()
            self._conn = None
