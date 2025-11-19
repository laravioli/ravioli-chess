import msgspec
from typing import Optional


class GameCreateIn(msgspec.Struct):
    white_player: Optional[str] = None
    black_player: Optional[str] = None


class GameCreateOut(msgspec.Struct):
    game_id: str
