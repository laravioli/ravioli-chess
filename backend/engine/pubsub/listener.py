import asyncio
from contextlib import suppress

from ravioli_core.pubsub import Connection
from ravioli_core.pubsub.types import MsgHandler
from ravioli_core.pubsub.utils import LazyEvent


class Listener:
    def __init__(self, connection: Connection):
        self._connection = connection
        self._shutdown = LazyEvent()

    def start(self, handler: MsgHandler):
        if self._shutdown.is_set():
            raise RuntimeError()
        self._connection.set_handler(handler)
        self._task = asyncio.create_task(self._connection.listen())

    async def stop(self):
        self._shutdown.set()
        if not self._task.done():
            self._task.cancel()
            with suppress(asyncio.CancelledError):
                await self._task
        await self._connection.aclose()
