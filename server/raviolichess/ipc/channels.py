from abc import ABC
from typing import ClassVar

# ╔══════════════════════════════════════╗
# ║        Game Server Channels          ║
# ╚══════════════════════════════════════╝


class Channel(str, ABC):
    name: ClassVar[str]

    def __new__(cls, chan):
        return super().__new__(cls, f"channel:{cls.name}:{chan}")


class GameCreateChan(Channel):
    """

    args:
        chan (int): process ID.
    """

    name = "gamecreate"


class GameChan(Channel):
    """

    args:
        chan (str): game ID.
    """

    name = "game"


# ╔══════════════════════════════════════╗
# ║        Ws Server Channels            ║
# ╚══════════════════════════════════════╝


class GroupChannel(str, ABC):
    name: ClassVar[str]

    def __new__(cls, chan):
        return super().__new__(cls, f"group_{cls.name}_{chan}")


class GameGroupChan(GroupChannel):
    """

    args:
        chan (str): game ID.
    """

    name = "game"
