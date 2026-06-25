from collections.abc import AsyncGenerator, Callable
from typing import Any, Protocol

type Chan = str


class Subscriber(Protocol):
    def put_nowait(self, item: Any) -> bool: ...
    def iter_message(self) -> AsyncGenerator[Any]: ...
    def shutdown(self, immediate=False) -> None: ...


type MsgHandler = Callable[[bytes, bytes], None]
