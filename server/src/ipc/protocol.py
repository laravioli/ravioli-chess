import msgspec
from typing import Optional
from __future__ import annotations

###-#-#-#-#-#-#-#-#-#-#-#-#-#-###
# INTERNAL PROTOCOL             #
# in:   ws -> game server       #
# out:  ws <- game server       #
###-#-#-#-#-#-#-#-#-#-#-#-#-#-###


# game creation
class GameCreateIn(msgspec.Struct):
    channel: str
    payload: GameCreatePayload


class GameCreatePayload(msgspec.Struct):
    white_player: Optional[str] = None
    black_player: Optional[str] = None


class GameCreateOut(msgspec.Struct):
    game_id: str


# game actions
class GameIn(msgspec.Struct, tag_field="t", tag=str.lower):
    user_id: str


class MoveIn(GameIn):
    san: str


###-#-#-#-#-#-#-#-#-#-#-#-#-#-###
# CLIENT PROTOCOL               #
# in:   ws -> client            #
# out:  ws <- client            #
###-#-#-#-#-#-#-#-#-#-#-#-#-#-###
