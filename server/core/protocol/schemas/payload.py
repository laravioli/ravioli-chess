import msgspec


class GameInfo(msgspec.Struct):
    white_player: str | None = msgspec.field(name="wp", default=None)
    black_player: str | None = msgspec.field(name="bp", default=None)
