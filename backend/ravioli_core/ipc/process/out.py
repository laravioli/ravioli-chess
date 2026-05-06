from typing import Literal

from msgspec import Raw, Struct


class ProcessOUT(Struct, tag_field="po", rename={"type": "t", "data": "d"}):
    pass


# ╔══════════════════════════════════════╗
# ║   websocket server <- ...            ║
# ╚══════════════════════════════════════╝
# ╔══════════════════════════════════════╗
# ║   SITE                               ║
# ╚══════════════════════════════════════╝


class TellUser(ProcessOUT, tag="s/user"):
    type: str
    data: Raw


class TellSocket(ProcessOUT, tag="s/socket"):
    type: str
    data: Raw


class GameCreate(ProcessOUT, tag="s/create"):
    data: Raw  # GameId


# ╔══════════════════════════════════════╗
# ║   PLAY                               ║
# ╚══════════════════════════════════════╝


# Frame
class GameUpdate(ProcessOUT, tag="g/update"):
    type: Literal["move", "takeback", "draw", "resign", "endData"]
    data: Raw


class GameId(Struct):
    game_id: str


class GameMove(Struct):
    san: str


class GameEnd(Struct):
    reason: str
