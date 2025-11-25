from __future__ import annotations
import msgspec
from typing import Optional

###-#-#-#-#-#-#-#-#-#-#-#-#-#-###
# PROTOCOL                      #
# in:   ws -> game server       #
# out:  ws <- game server       #
###-#-#-#-#-#-#-#-#-#-#-#-#-#-###


class GameCreateIn(msgspec.Struct):
    channel: str
    white_player: Optional[str] = msgspec.field(name="wp", default=None)
    black_player: Optional[str] = msgspec.field(name="bp", default=None)


class GameCreateOut(msgspec.Struct):
    game_id: str


class GameIn(msgspec.Struct, tag_field="t", tag=str.lower):
    pass


class MoveIn(GameIn):
    san: str


class Resign(GameIn):
    player: str


GameProtocolIn = MoveIn | Resign


class GameOut(msgspec.Struct, tag_field="t", tag=str.lower):
    pass


class MoveOut(GameOut):
    ok: bool
    san: str


class GameEndOut(GameOut):
    reason: str


GameProtocolOut = MoveOut | GameEndOut
