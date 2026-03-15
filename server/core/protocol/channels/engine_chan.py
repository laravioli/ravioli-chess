from abc import ABC
from typing import ClassVar

# ╔══════════════════════════════════════╗
# ║          Engine Channels             ║
# ╚══════════════════════════════════════╝


class EngineChan(str, ABC):
    name: ClassVar[str]

    def __new__(cls, chan):
        return super().__new__(cls, f"chan:engine:{cls.name}:{chan}")


class GameCreate(EngineChan):
    """

    args:
        chan (int): process ID.
    """

    name = "game:create"


class Game(EngineChan):
    """

    args:
        chan (str): game ID.
    """

    name = "game"
