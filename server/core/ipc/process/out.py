from typing import Literal

from msgspec import Raw, Struct


class ProcessOut(Struct, tag_field="po", rename={"type": "t", "data": "d"}):
    pass


# ╔══════════════════════════════════════╗
# ║   ENGINE OUT : ws <- engine          ║
# ╚══════════════════════════════════════╝


# Frame
class GameUpdate(ProcessOut, tag="g/update"):
    type: Literal["move", "takeback", "draw", "resign", "endData"]
    data: Raw


class GameCreate(ProcessOut, tag="g/create"):
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


class TellUser(ProcessOut, tag="t/user"):
    data: Raw


class TellSocket(ProcessOut, tag="t/socket"):
    data: Raw


# types
type EngineFrameOut = GameUpdate | GameUpdate
type AppFrameOut = TellUser | TellSocket
type ProcessFrameOut = EngineFrameOut | AppFrameOut
