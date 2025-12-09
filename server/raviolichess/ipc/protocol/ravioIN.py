from __future__ import annotations
import msgspec
from typing import Optional, Union

# ╔══════════════════════════════════════╗
# ║   PROTOCOL IN : ravio <- ws          ║
# ╚══════════════════════════════════════╝


class TMsg(msgspec.Struct, tag_field="t", tag=str.lower):
    pass


class GameCreate(TMsg):
    channel: str
    white_player: Optional[str] = msgspec.field(name="wp", default=None)
    black_player: Optional[str] = msgspec.field(name="bp", default=None)


class ChallengeAccepted(TMsg, tag="caccept"):
    id: str
    white_player: str = msgspec.field(name="wp")
    black_player: str = msgspec.field(name="bp")


class GameMove(TMsg):
    san: str


class GameResign(TMsg):
    player: str


GameStart = Union[GameCreate, ChallengeAccepted]
GameProtocol = Union[GameMove, GameResign]
