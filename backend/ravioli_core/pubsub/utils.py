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

    def set(self):
        self._event.set()

    def clear(self):
        self._event.clear()

    def is_set(self):
        return self._event.is_set()

    async def wait(self):
        await self._event.wait()


def str_if_bytes(value: str | bytes):
    if isinstance(value, bytes):
        value = value.decode("utf-8", errors="replace")
    return value
