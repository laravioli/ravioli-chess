import asyncio
from collections import defaultdict
from collections.abc import Callable, Iterable
from contextlib import asynccontextmanager, suppress

from redis.asyncio import Redis

from ravioli_core.serializers import json

from .backend import ChannelBackend
from .bus import EventBus
from .exceptions import BroadcastClosed
from .subscriber import Subscriber
from .topic import Topic
from .utils import LazyEvent


class Broadcast:
    def __init__(
        self,
        redis: Redis,
        topics: Callable[[EventBus], dict[str, Topic]],
    ):
        self._redis = redis
        self._bus = EventBus()
        self._topics = topics(self._bus)
        self._closed_event = LazyEvent()

    async def start(self):

        if not (self._closed_event.is_set() or hasattr(self, "_task")):
            self._task = asyncio.create_task(self._run())
        return self._task

    async def stop(self):
        if not self._closed_event.is_set():
            self._task.cancel()
            with suppress(asyncio.CancelledError):
                await self._task

    async def _run(self, immediate_shutdown=False):
        try:
            async with asyncio.TaskGroup() as tg:
                for topic in self._topics.values():
                    tg.create_task(topic.run(self._redis))
        finally:
            for sub in self._bus.subscribers:
                # NOTE should not be called while Topics are running
                sub.shutdown(immediate=immediate_shutdown)
            self._closed_event.set()

    async def publish(self, chan: str, msg: object):
        await self._redis.publish(chan, json.encode(msg))

    @asynccontextmanager
    async def start_subscription(self, sub: Subscriber, *chans: str):
        """
        Subscribe/Unsubscribe sequentially
        """
        grouped = groupby(chans)
        try:
            for topic_name, topic_chans in grouped.items():
                topic = self._topics[topic_name]
                await topic.subscribe(sub, topic_chans)

            if self._closed_event.is_set():
                raise BroadcastClosed()
            yield
        finally:
            for topic_name, topic_chans in grouped.items():
                topic = self._topics[topic_name]
                await topic.unsubscribe(sub, topic_chans)


def groupby(chans: Iterable[str]):
    """
    Group a list of channels by related topic
    """
    grouped = defaultdict(list)
    for chan in chans:
        topic = chan.split(":", 2)[1]
        grouped[topic].append(chan)
    return grouped


class LightBroadcast:
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
        self.has_subscribers = LazyEvent()
        self.closed_event = LazyEvent()

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
        if not (self.closed_event.is_set() or hasattr(self, "_task")):
            self._task = asyncio.create_task(self._run())

        return self._task

    async def stop(self):
        if not self.closed_event.is_set():
            self._task.cancel()
            with suppress(asyncio.CancelledError):
                await self._task
        await self._backend.stop()

    async def publish(self, channel: str, message: object):
        await self._backend.publish(channel, json.encode(message))

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
            args = self._channel_map.keys()

        backend_unsubscribe = set()

        for channel in args:
            self._channel_map[channel].discard(subscriber)
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
