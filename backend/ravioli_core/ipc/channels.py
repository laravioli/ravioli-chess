from abc import ABC
from typing import ClassVar

# ╔══════════════════════════════════════╗
# ║             App Channels             ║
# ╚══════════════════════════════════════╝


class AppChan(str, ABC):
    name: ClassVar[str]

    def __new__(cls, chan):
        return super().__new__(cls, f"chan:app:{cls.name}:{chan}")


# ╔══════════════════════════════════════╗
# ║          Engine Channels             ║
# ╚══════════════════════════════════════╝


class EngineChan(str, ABC):
    name: ClassVar[str]

    def __new__(cls, chan):
        return super().__new__(cls, f"chan:engine:{cls.name}:{chan}")


class EngineGameCreateChan(EngineChan):
    """

    args:
        chan (int): process ID.
    """

    name = "game:create"


class EngineGameChan(EngineChan):
    """

    args:
        chan (str): game ID.
    """

    name = "game"


type ProcessChan = AppChan | EngineChan

# ╔══════════════════════════════════════╗
# ║        Websocket Channels            ║
# ╚══════════════════════════════════════╝


class WebsocketChan(str, ABC):
    name: ClassVar[str]

    def __new__(cls, chan):
        return super().__new__(cls, f"chan:ws:{cls.name}:{chan}")


class ConsumerChan(WebsocketChan):
    """

    args:
        sri: str
    """

    name = "socket"


class UserChan(WebsocketChan):
    """

    args:
        uuid (str): user uuid.
    """

    name = "user"


class WsGameChan(WebsocketChan):
    """

    args:
        chan (str): game ID.
    """

    name = "game"
