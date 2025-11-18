import asyncio
from .channels import Channel
from abc import ABC, abstractmethod
from typing import Type, TypeVar, ClassVar, Generic

T = TypeVar("T", bound=Channel)


class BackgroundSubscriber(ABC, Generic[T]):
    """interface for subscribing to pubsub channel"""

    channel_factory: ClassVar[Type[T]]

    @property
    @abstractmethod
    def channel(self) -> str:
        """return channel.chan"""
        ...

    @abstractmethod
    async def on_message(self, message):
        """callback when a message arrive in a channel"""
        ...


class BackgroundRegistry:
    _registry = {}

    @classmethod
    def register(cls, instance):
        """add a background subscriber to registry"""
        if not isinstance(instance, BackgroundSubscriber):
            raise ValueError(
                f"{instance} is not a background subscriber, it can't be added to background registry"
            )
        cls._registry.update({instance.channel: instance.on_message})

    @classmethod
    def all(cls):
        return cls._registry


class BackgroundListener:
    """pubsub for process communication"""

    def __init__(self, *, layer):
        self._pubsub = layer.pubsub(ignore_subscribe_messages=True)

    def start(self):
        self._task = asyncio.create_task(self.run())

    async def run(self):
        # run must be called after all susbcriber are instantiated
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
        # if i need gather -> return exeption = True to not leak tasks or TaskGroup


# Note
# A new alternative to create and run tasks concurrently and wait for their completion is asyncio.TaskGroup.
# TaskGroup provides stronger safety guarantees than gather for scheduling a nesting of subtasks:
# if a task (or a subtask, a task scheduled by a task) raises an exception,
# TaskGroup will, while gather will not, cancel the remaining scheduled tasks).

# when masking cancellation (uncancelled)
# If end-user code is, for some reason, suppressing cancellation by catching CancelledError, it needs to call this method to remove the cancellation state.
