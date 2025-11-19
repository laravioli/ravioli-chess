from typing import ClassVar
from abc import ABC, abstractmethod
from functools import cached_property


class Channel(ABC):
    prefix: ClassVar[str] = "channel"

    @property
    @abstractmethod
    def chan(self) -> str: ...


class ChanGameCreate(Channel):

    def __init__(self, pid):
        self.pid = pid

    @cached_property
    def chan(self):
        return f"{self.prefix}:{self.__class__.__qualname__.lower()}:{self.pid}"


class ChanGame(Channel):

    def __init__(self, game_id):
        self.game_id = game_id

    @cached_property
    def chan(self):
        return f"{self.prefix}:{self.__class__.__qualname__.lower()}:{self.game_id}"
