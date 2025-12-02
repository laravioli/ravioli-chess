from __future__ import annotations
import msgspec
from typing import Optional, Union

# ╔══════════════════════════════════════╗
# ║   PROTOCOL IN : ravio <- ws          ║
# ╚══════════════════════════════════════╝


class GameCreate(msgspec.Struct):
    channel: str
    white_player: Optional[str] = msgspec.field(name="wp", default=None)
    black_player: Optional[str] = msgspec.field(name="bp", default=None)


class Game(msgspec.Struct, tag_field="t", tag=str.lower):
    pass


class GameMove(Game):
    san: str


class GameResign(Game):
    player: str


Protocol = Union[GameMove, GameResign]
