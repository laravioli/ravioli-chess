import asyncio
from collections.abc import Callable
from contextlib import asynccontextmanager, suppress

from core.serializers import msgpack

from .backend import ChannelBackend
from .subscriber import Subscriber


class Broadcast:
    def __init__(
        self,
        backend: ChannelBackend,
        background_channels: dict[str, Callable] | None = None,
    ):
        """
        Args:
            backend: broker to manage message
            background_channels: dict of callbacks associated to a channel
        """
        self._backend = backend
        self._background_channels = background_channels
        self._channel_map: dict[str, set[Subscriber]] = {}
        self._dispatch_task = None
        self._is_running = asyncio.Event()

    async def start(self):
        self._dispatch_task = asyncio.create_task(self._dispatch())
        if self._background_channels:
            await self._backend.subscribe(**self._background_channels)
        self._is_running.set()

    async def stop(self, immediate=False):
        """
        Args:
            immediate: weither to shutdown queues immediatly or after draining
        """
        self._is_running.clear()

        # stop producing message
        if self._dispatch_task:
            with suppress(asyncio.CancelledError):
                self._dispatch_task.cancel()
                await self._dispatch_task
            self._dispatch_task = None

        # tell application code we close
        for subscriber in set().union(*self._channel_map.values()):
            subscriber._queue.shutdown(immediate=immediate)

        await self._backend.stop()

    async def publish(self, channel: str, message: object):
        await self._backend.publish(channel, msgpack.encode(message))

    async def subscribe(self, *args: str):
        """
        Create a new instance of Subscriber and register it to channels.

        Args:
            args:Each argument represent a channel to subscribe to
        """
        # note: ensure application code doesn't create new subscriber before/after start/stop
        if not self._is_running.is_set():
            raise RuntimeError("Cannot create subscription: Broadcast service is not running.")

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

        return subscriber

    async def unsubscribe(self, susbcriber: Subscriber, *args: str):
        if not args:
            args = list(self._channel_map.keys())

        backend_unsubscribe = set()

        for channel in args:
            try:
                self._channel_map[channel].remove(susbcriber)
            except KeyError:
                pass
            if not self._channel_map[channel]:
                backend_unsubscribe.add(channel)
                del self._channel_map[channel]

        if backend_unsubscribe:
            await self._backend.unsubscribe(*backend_unsubscribe)

    @asynccontextmanager
    async def start_subscription(self, *args: str):
        subscriber = await self.subscribe(*args)
        try:
            yield subscriber
        finally:
            await self.unsubscribe(subscriber, *args)

    async def _dispatch(self):
        try:
            async for channel, message in self._backend.stream():
                for subscriber in self._channel_map.get(channel, ()):
                    subscriber.put_nowait(message)
        except Exception:
            self._is_running.clear()
            raise
