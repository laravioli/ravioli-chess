import msgspec
from typing import Optional


class GameCreatePayload(msgspec.Struct):
    white_player: Optional[str] = None
    black_player: Optional[str] = None


class GameCreateMessage(msgspec.Struct):
    channel: str
    payload: GameCreatePayload


class GameCreateOut(msgspec.Struct):
    game_id: str
