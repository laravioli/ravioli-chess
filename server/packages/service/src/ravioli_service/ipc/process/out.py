from typing import Literal

from msgspec import Raw, Struct


class ProcessOUT(Struct, tag_field="po", rename={"type": "t", "data": "d"}):
    pass


# ╔══════════════════════════════════════╗
# ║   ENGINE OUT : ws <- engine          ║
# ╚══════════════════════════════════════╝


# Frame
class GameUpdate(ProcessOUT, tag="g/update"):
    type: Literal["move", "takeback", "draw", "resign", "endData"]
    data: Raw


class GameCreate(ProcessOUT, tag="g/create"):
    data: Raw  # GameId


# Data
# note: -> Raw in Frame to not deserialise data on ws side
# cons: loose typing for serialisation
class GameId(Struct):
    game_id: str


class GameMove(Struct):
    san: str


class GameEnd(Struct):
    reason: str


# ╔══════════════════════════════════════╗
# ║   APP OUT : ws <- app                ║
# ╚══════════════════════════════════════╝


class TellUser(ProcessOUT, tag="t/user"):
    type: str
    data: Raw


class TellSocket(ProcessOUT, tag="t/socket"):
    type: str
    data: Raw


# types
type EngineOUT = GameUpdate | GameUpdate
type AppOUT = TellUser | TellSocket
