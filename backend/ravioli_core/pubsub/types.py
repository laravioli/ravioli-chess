from collections.abc import AsyncGenerator, Callable
from typing import Any, Protocol, overload

type Chan = str


class Subscriber(Protocol):
    def put_nowait(self, item: Any) -> bool: ...
    @overload
    async def iter_message(self) -> AsyncGenerator: ...
    async def iter_message[T](self, type_arg: type[T]) -> AsyncGenerator[T]: ...
    def shutdown(self, immediate=False) -> None: ...


type MsgHandler = Callable[[bytes, bytes], None]
