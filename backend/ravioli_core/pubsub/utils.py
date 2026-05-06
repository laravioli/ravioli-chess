import asyncio


class LazyEvent:
    def __init__(self) -> None:
        self.__event: asyncio.Event | None = None

    @property
    def _event(self) -> asyncio.Event:
        if self.__event is None:
            self.__event = asyncio.Event()
        return self.__event

    def set(self) -> None:
        self._event.set()

    def is_set(self) -> bool:
        return self._event.is_set()

    def clear(self) -> None:
        self._event.clear()

    async def wait(self) -> None:
        await self._event.wait()
