import asyncio
from collections.abc import Awaitable, Callable


class Scheduler:
    def __init__(self):
        self._periodic_coros = []
        self._tasks: set[asyncio.Task] = set()

    def start(self):
        for coro in self._periodic_coros:
            task = asyncio.create_task(coro())
            self._tasks.add(task)
            task.add_done_callback(self._tasks.discard)

    async def shutdown(self):
        for task in self._tasks:
            task.cancel()
        await asyncio.gather(*self._tasks, return_exceptions=True)

    def periodic(self, interval: float, duration: float = 0, event: asyncio.Event | None = None):
        """
        Schedule a coroutine periodically

        Parameters
        ----------
        interval : float
            periodic schedule time
        duration : float, optional
            waiting time before scheduling coro
        event : asyncio.Event, optional
            Event before scheduling coro
        """

        def decorator(coro: Callable[[], Awaitable[None]]):
            async def periodic_coro():
                if event:
                    await event.wait()
                elif duration > 0.0:
                    await asyncio.sleep(duration)

                await coro()
                while True:
                    await asyncio.sleep(interval)
                    await coro()

            self._periodic_coros.append(periodic_coro)
            return coro

        return decorator
