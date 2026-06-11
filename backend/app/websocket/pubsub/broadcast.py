import asyncio
from contextlib import asynccontextmanager, suppress

from redis.asyncio import Redis

from app.websocket.consumer import Subscriber
from app.websocket.schemas import MaybeUser
from ravioli_core.pubsub import Connection
from ravioli_core.pubsub.types import Chan
from ravioli_core.pubsub.utils import LazyEvent

from .bus import EventBus
from .exceptions import BroadcastClosed
from .handlers import make_handler
from .users import Users


class Broadcast:
    def __init__(
        self,
        connection: Connection,
        redis: Redis,
        users: Users,
    ):
        self._connection = connection
        self._redis = redis
        self._users = users
        self._bus = EventBus()
        self._connection.set_handler(make_handler(self._bus, self._users))
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

    async def _run(self):
        try:
            await self._connection.listen()
        finally:
            for sub in self._bus.subs:
                sub.shutdown(immediate=False)
            self._closed_event.set()

    @asynccontextmanager
    async def start_subscription(self, sub: Subscriber, user: MaybeUser, chans: list[Chan]):
        """
        Subscribe/Unsubscribe sequentially
        """
        try:
            if self._closed_event.is_set():
                raise BroadcastClosed()
            self._bus.register(sub)
            user_chan = await self._users.connect(sub, user)
            new_chans = self._bus.subscribe(sub, chans)
            if user_chan:
                new_chans.add(user_chan)
            if len(new_chans) > 0:
                await self._connection.subscribe(new_chans)

            #####
            yield
            #####

        finally:
            self._bus.unregister(sub)
            self._users.disconnect(sub, user)
            old_chans = self._bus.unsubscribe(sub, chans)
            if len(old_chans) > 0:
                await self._connection.unsubscribe(old_chans)
