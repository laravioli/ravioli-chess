from typing import Literal

from msgspec import Raw, Struct


class ProcessOUT(Struct, tag_field="po", rename={"type": "t", "data": "d"}):
    pass


# ╔══════════════════════════════════════╗
# ║   websocket server <- ...            ║
# ╚══════════════════════════════════════╝


# ╔══════════════════════════════════════╗
# ║   SRI                                ║
# ╚══════════════════════════════════════╝


class TellSri(ProcessOUT, tag="tell"):
    type: str
    data: Raw


class GameCreate(ProcessOUT, tag="gc"):
    data: Raw  # GameId


type Sri = TellSri | GameCreate

# ╔══════════════════════════════════════╗
# ║   USERS                              ║
# ╚══════════════════════════════════════╝


class TellUser(ProcessOUT, tag="tell"):
    type: str
    data: Raw


type Users = TellUser

# ╔══════════════════════════════════════╗
# ║   PLAY                               ║
# ╚══════════════════════════════════════╝


# Frame
class GameUpdate(ProcessOUT, tag="u"):
    type: Literal["move", "takeback", "draw", "resign", "endData"]
    data: Raw


class GameId(Struct):
    game_id: str


class GameMove(Struct):
    san: str


class GameEnd(Struct):
    reason: str


type Play = GameUpdate
