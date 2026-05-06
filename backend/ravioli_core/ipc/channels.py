from abc import ABC
from typing import ClassVar

# NOTE struture:
# NOTE 1- target
# NOTE 2- topic
# NOTE 3- chan

# ╔══════════════════════════════════════╗
# ║             App Channels             ║
# ╚══════════════════════════════════════╝


class AppChan(str, ABC):
    topic: ClassVar[str]

    def __new__(cls, chan):
        return super().__new__(cls, f"app:{cls.topic}:{chan}")


# ╔══════════════════════════════════════╗
# ║          Engine Channels             ║
# ╚══════════════════════════════════════╝


class EngineChan(str, ABC):
    topic: ClassVar[str]

    def __new__(cls, chan):
        return super().__new__(cls, f"engine:{cls.topic}:{chan}")


class EngineCreateChan(EngineChan):
    """

    args:
        chan (int): process ID.
    """

    topic = "create"


class EngineGameChan(EngineChan):
    """

    args:
        chan (str): game ID.
    """

    topic = "game"


type ProcessChan = AppChan | EngineChan

# ╔══════════════════════════════════════╗
# ║        Websocket Channels            ║
# ╚══════════════════════════════════════╝


class WebsocketChan(str, ABC):
    topic: ClassVar[str]

    def __new__(cls, chan):
        return super().__new__(cls, f"ws:{cls.topic}:{chan}")


# ╔══════════════════════════════════════╗
# ║        Site                          ║
# ╚══════════════════════════════════════╝


class WsSiteChan(WebsocketChan):
    topic = "site"


class WsConsumerChan(WsSiteChan):
    """

    args:
        sri: str
    """

    def __new__(cls, sri):
        return super().__new__(cls, f"sri:{sri}")


class WsUserChan(WsSiteChan):
    """

    args:
        uuid (str): user uuid.
    """

    def __new__(cls, uuid):
        return super().__new__(cls, f"user:{uuid}")


# ╔══════════════════════════════════════╗
# ║        Play                          ║
# ╚══════════════════════════════════════╝


class WsPlayChan(WebsocketChan):
    """

    args:
        chan (str): game ID.
    """

    topic = "play"
