from typing import ClassVar
from abc import ABC, abstractmethod
from functools import cached_property


class Channel(ABC):
    prefix: ClassVar[str] = "channel"

    def __init__(self, name: str):
        self.name = name

    @property
    @abstractmethod
    def chan(self) -> str: ...


class ChanId(Channel):

    @cached_property
    def chan(self) -> str:
        return f"{self.prefix}:{self.__class__.__qualname__.lower()}:{self.name}"
