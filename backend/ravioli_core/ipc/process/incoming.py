from msgspec import Struct, field

# ╔══════════════════════════════════════╗
# ║   ENGINE IN : ws -> engine           ║
# ╚══════════════════════════════════════╝


# Data
class GameInfo(Struct):
    white_player: str | None = field(name="wp", default=None)
    black_player: str | None = field(name="bp", default=None)


# Frame
class ProcessIn(Struct, tag_field="pi"): ...


class GameCreate(ProcessIn):
    sri: str
    data: GameInfo


class ChallengeAccepted(ProcessIn):
    id: str
    sri: str
    data: GameInfo


class GameMove(ProcessIn):
    san: str


class GameResign(ProcessIn):
    player: str


# types
type GameStart = GameCreate | ChallengeAccepted
type GameUpdate = GameMove | GameResign
