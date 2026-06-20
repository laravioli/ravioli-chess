import asyncio

from ravioli_core.ipc.e_in import GameUpdate


class Subscriber:
    def __init__(self, maxsize=100):
        self._queue: asyncio.Queue[GameUpdate] = asyncio.Queue(maxsize=maxsize)

    def put_nowait(self, item: GameUpdate) -> bool:
        """Put an item in the subscriber's stream without waiting"""
        try:
            self._queue.put_nowait(item)
            return True
        except asyncio.QueueFull:
            return False

    async def iter_message(self):
        while True:
            try:
                message = await self._queue.get()
                # this implicitly means messages are subtype of "T"
                # i should define explictly what can of message a subscriber is waiting for
                yield message
            except asyncio.QueueShutDown:
                break

    def shutdown(self, immediate=False):
        self._queue.shutdown(immediate=immediate)
