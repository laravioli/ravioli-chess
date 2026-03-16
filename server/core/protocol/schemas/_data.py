from msgspec import Struct, field


class GameRouting(Struct):
    game_id: str


class GameInfo(Struct):
    white_player: str | None = field(name="wp", default=None)
    black_player: str | None = field(name="bp", default=None)


class MoveData(Struct):
    san: str


class ValidatedMove(Struct):
    ok: bool
    san: str


class GameStop(Struct):
    reason: str
