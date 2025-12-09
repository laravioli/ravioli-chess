import asyncio
import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class Manager(ABC):
    """interface that define services with lifecycle method"""

    def start(self) -> asyncio.Task:
        """main manager task, registry handle termination"""
        run_task = asyncio.create_task(self.run())
        return run_task

    @abstractmethod
    async def run(self) -> None: ...

    @abstractmethod
    async def stop(self) -> None: ...


class ManagerRegistry:
    """order of registration matter, manager start in the registered order
    and stop in the reverse order"""

    def __init__(self):
        self._registry: dict[str, Manager] = {}
        self._tasks: list[asyncio.Task] = []

    def register(self, name, instance: Manager):
        """add a background subscriber to registry"""
        assert isinstance(instance, Manager)
        self._registry[name] = instance

    def get(self, key):
        return self._registry[key]

    def start(self):
        for manager in self._registry.values():
            self._tasks.append(manager.start())

    async def stop(self):
        for task in reversed(self._tasks):
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            except BaseException:
                logger.exception("Unexpected exception when stopping managers")
