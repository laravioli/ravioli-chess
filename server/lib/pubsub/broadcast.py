import asyncio
from contextlib import asynccontextmanager, suppress

from lib.serializers import msgpack

from .backend import ChannelBackend
from .subscriber import Subscriber


class BroadcastClosed(Exception):
    pass


# note: to make it a true library, it should be serializer agnostic


class Broadcast:
    def __init__(
        self,
        backend: ChannelBackend,
        immediate_shutdown=False,
    ):
        """
        Args:
            backend: broker to manage message
            immediate_shutdown: weither to let application consume pending messages in susbcribers
        """
        self._backend = backend
        self._immediate_shutdown = immediate_shutdown
        self._channel_map: dict[str, set[Subscriber]] = {}
        self.has_subscribers = asyncio.Event()
        self.closed_event = asyncio.Event()

    @property
    def subscribers(self):
        return set().union(*self._channel_map.values())

    async def _run(self):
        try:
            while True:
                await self.has_subscribers.wait()
                async for channel, message in self._backend.stream():
                    for subscriber in self._channel_map.get(channel, ()):
                        subscriber.put_nowait(message)
        finally:
            for sub in self.subscribers:
                sub.shutdown(immediate=self._immediate_shutdown)
            self.closed_event.set()

    async def start(self):
        """start filling subscriber's queue"""
        if not (self.closed_event.is_set() or hasattr(self, "_task")):
            self._task = asyncio.create_task(self._run())

        return self._task

    async def stop(self):
        """stop filling subscriber's queue"""
        if not self.closed_event.is_set():
            with suppress(asyncio.CancelledError):
                self._task.cancel()
                await self._task
        await self._backend.stop()

    async def publish(self, channel: str, message: object):
        await self._backend.publish(channel, msgpack.encode(message))

    async def subscribe(self, *args: str):
        """
        Create a new instance of Subscriber and register it to channels.

        Args:
            args:Each argument represent a channel to subscribe to
        """

        subscriber = Subscriber()

        backend_subscribe = set()

        for channel in args:
            if channel not in self._channel_map:
                self._channel_map[channel] = set()
            if not self._channel_map[channel]:
                backend_subscribe.add(channel)
            self._channel_map[channel].add(subscriber)

        if backend_subscribe:
            await self._backend.subscribe(*backend_subscribe)
            if not self.has_subscribers.is_set():
                self.has_subscribers.set()

        return subscriber

    async def unsubscribe(self, subscriber: Subscriber, *args: str):
        if not args:
            args = list(self._channel_map.keys())

        backend_unsubscribe = set()

        for channel in args:
            try:
                self._channel_map[channel].remove(subscriber)
            except KeyError:
                pass
            if not self._channel_map[channel]:
                backend_unsubscribe.add(channel)
                del self._channel_map[channel]

        if backend_unsubscribe:
            await self._backend.unsubscribe(*backend_unsubscribe)
            if len(self._channel_map) == 0:
                self.has_subscribers.clear()

    @asynccontextmanager
    async def start_subscription(self, *args: str):
        try:
            subscriber = await self.subscribe(*args)
            if self.closed_event.is_set():
                raise BroadcastClosed()
            yield subscriber
        finally:
            await self.unsubscribe(subscriber, *args)
