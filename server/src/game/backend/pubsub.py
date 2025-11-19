import asyncio
from .background import BackgroundRegistry
from redis.asyncio import Redis


class ChannelManager:
    """pubsub for process communication"""

    def __init__(self, *, layer: Redis):
        self._pubsub = layer.pubsub(ignore_subscribe_messages=True)
        self._lock = asyncio.Lock()

    def start(self):
        self._task = asyncio.create_task(self.run())

    async def run(self):
        # run must be called after all background susbcriber are registered
        p = self._pubsub
        async with p:
            await p.subscribe(**BackgroundRegistry.all())
            async for _ in p.listen():
                pass

    async def stop(self):
        self._task.cancel()
        try:
            await self._task
        except asyncio.CancelledError:
            pass
        finally:
            await self._pubsub.aclose()

    async def subscribe(self, channel_with_callback):
        async with self._lock:
            self._pubsub.subscribe(**channel_with_callback)

    async def unsubscribe(self, channel):
        async with self._lock:
            self._pubsub.unsubscribe(channel)


# if i need gather -> return exeption = True to not leak tasks or TaskGroup

# Note
# A new alternative to create and run tasks concurrently and wait for their completion is asyncio.TaskGroup.
# TaskGroup provides stronger safety guarantees than gather for scheduling a nesting of subtasks:
# if a task (or a subtask, a task scheduled by a task) raises an exception,
# TaskGroup will, while gather will not, cancel the remaining scheduled tasks).

# when masking cancellation (uncancelled)
# If end-user code is, for some reason, suppressing cancellation by catching CancelledError, it needs to call this method to remove the cancellation state.
