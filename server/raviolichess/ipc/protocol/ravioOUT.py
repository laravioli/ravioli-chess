from __future__ import annotations
import msgspec

# ╔══════════════════════════════════════╗
# ║   PROTOCOL OUT : ravio -> ws         ║
# ╚══════════════════════════════════════╝


class GameCreate(msgspec.Struct):
    game_id: str


class Game(msgspec.Struct, tag_field="t", tag=str.lower):
    pass


class GameMove(Game):
    ok: bool
    san: str


class GameEnd(Game):
    reason: str


Protocol = GameMove | GameEnd
