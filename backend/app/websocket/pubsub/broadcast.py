import asyncio
from collections.abc import Iterable
from contextlib import asynccontextmanager, suppress

from app.websocket.consumer import Subscriber
from app.websocket.schemas import MaybeUser
from ravioli_core.pubsub import Connection
from ravioli_core.pubsub.exceptions import BroadcastStopped
from ravioli_core.pubsub.types import Chan
from ravioli_core.pubsub.utils import LazyEvent

from .bus import EventBus
from .handlers import make_handler
from .users import Users


class Broadcast:
    def __init__(
        self,
        connection: Connection,
        users: Users,
    ):
        self._connection = connection
        self._users = users
        self._bus = EventBus()
        self._connection.set_handler(make_handler(self._bus, self._users))
        self._shutdown = LazyEvent()

    async def start(self):
        if self._shutdown.is_set():
            raise BroadcastStopped()
        self._task = asyncio.create_task(self._connection.listen())

    async def stop(self):
        self._shutdown.set()
        if not self._task.done():
            self._task.cancel()
            with suppress(asyncio.CancelledError):
                await self._task
        await self._connection.aclose()

    @asynccontextmanager
    async def start_subscription(self, sub: Subscriber, user: MaybeUser, chans: Iterable[Chan]):
        """
        Subscribe/Unsubscribe sequentially
        """
        try:
            new_chans = self._bus.subscribe(sub, chans)
            user_chan = await self._users.connect(sub, user)
            if user_chan:
                new_chans.add(user_chan)
            if len(new_chans) > 0:
                await self._connection.subscribe(new_chans)

            #####
            yield
            #####

        finally:
            self._users.disconnect(sub, user)
            old_chans = self._bus.unsubscribe(sub, chans)
            if len(old_chans) > 0:
                await self._connection.unsubscribe(old_chans)
