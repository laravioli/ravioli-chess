from msgspec import Struct, field

# ╔══════════════════════════════════════╗
# ║    ENGINE <- WEBSOCKET               ║
# ╚══════════════════════════════════════╝


# ╔══════════════════════════════════════╗
# ║    DATA                              ║
# ╚══════════════════════════════════════╝


class D_GameClock(Struct):
    time_control: int | None = field(name="tc", default=None)
    increment: int | None = field(name="incr", default=None)


# ╔══════════════════════════════════════╗
# ║    FRAME                             ║
# ╚══════════════════════════════════════╝


class EngineIn(Struct, tag_field="ei"): ...


class GameStart(EngineIn):
    game_id: str
    sri: str
    clock: D_GameClock | None = field(name="ck", default=None)


class ChallengeAccepted(EngineIn):
    game_id: str
    sri: str
    clock: D_GameClock


class GameMove(EngineIn):
    game_id: str
    san: str


class GameResign(EngineIn):
    game_id: str
    color: str


# types
type GameUpdate = GameMove | GameResign
