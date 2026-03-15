from abc import ABC
from typing import ClassVar

# ╔══════════════════════════════════════╗
# ║        Websocket Channels            ║
# ╚══════════════════════════════════════╝


class WebsocketChan(str, ABC):
    name: ClassVar[str]

    def __new__(cls, chan):
        return super().__new__(cls, f"chan:ws:{cls.name}:{chan}")


class Socket(WebsocketChan):
    """

    args:
        uuid (str): socket uuid.
    """

    name = "socket"


class Game(WebsocketChan):
    """

    args:
        chan (str): game ID.
    """

    name = "game"
