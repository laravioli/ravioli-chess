from abc import ABC
from typing import ClassVar

# ╔══════════════════════════════════════╗
# ║          Engine Channels             ║
# ╚══════════════════════════════════════╝


class EngineChanStr(str, ABC):
    name: ClassVar[str]

    def __new__(cls, chan):
        return super().__new__(cls, f"chan:engine:{cls.name}:{chan}")


class EngineChan:
    class GameCreate(EngineChanStr):
        """

        args:
            chan (int): process ID.
        """

        name = "game:create"

    class Game(EngineChanStr):
        """

        args:
            chan (str): game ID.
        """

        name = "game"


# ╔══════════════════════════════════════╗
# ║        Websocket Channels            ║
# ╚══════════════════════════════════════╝


class WsChanStr(str, ABC):
    name: ClassVar[str]

    def __new__(cls, chan):
        return super().__new__(cls, f"chan:ws:{cls.name}:{chan}")


class WsChan:
    class Socket(WsChanStr):
        """

        args:
            uuid (str): socket uuid.
        """

        name = "socket"

    class Game(WsChanStr):
        """

        args:
            chan (str): game ID.
        """

        name = "game"
