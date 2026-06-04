import asyncio
from functools import cached_property


class LazyEvent:
    def __init__(self) -> None:
        self.__event: asyncio.Event | None = None

    @cached_property
    def _event(self) -> asyncio.Event:
        if self.__event is None:
            self.__event = asyncio.Event()
        return self.__event

    def __enter__(self):
        self._event.clear()
        return None

    def __exit__(self, exc_type, exc, tb):
        self._event.set()

    def set(self) -> None:
        self._event.set()

    def clear(self) -> None:
        self._event.clear()

    def is_set(self) -> bool:
        return self._event.is_set()

    async def wait(self) -> None:
        await self._event.wait()
