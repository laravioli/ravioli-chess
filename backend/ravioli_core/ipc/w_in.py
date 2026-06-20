from typing import Literal

from msgspec import Raw, Struct


class WebsocketIn(Struct, tag_field="wi", rename={"type": "t", "data": "d"}):
    pass


# ╔══════════════════════════════════════╗
# ║   WEBSOCKET <- APP / ENGINE          ║
# ╚══════════════════════════════════════╝


# ╔══════════════════════════════════════╗
# ║   SRI                                ║
# ╚══════════════════════════════════════╝


class TellSri(WebsocketIn, tag="tell"):
    type: str
    data: Raw


type Sri = TellSri

# ╔══════════════════════════════════════╗
# ║   USERS                              ║
# ╚══════════════════════════════════════╝


class TellUser(WebsocketIn, tag="tell"):
    type: str
    data: Raw


type Users = TellUser

# ╔══════════════════════════════════════╗
# ║   PLAY                               ║
# ╚══════════════════════════════════════╝


# Data
class D_GameMove(Struct):
    san: str


class D_GameEnd(Struct):
    reason: str


class D_GameId(Struct):
    game_id: str


# Frame
class GameUpdate(WebsocketIn, tag="u"):
    type: Literal["move", "takeback", "draw", "resign", "endData"]
    data: Raw
