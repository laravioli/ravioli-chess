import msgspec

# ╔══════════════════════════════════════╗
# ║   PROTOCOL OUT : client -> ws        ║
# ╚══════════════════════════════════════╝


class TMessage(msgspec.Struct, tag_field="t"): ...


class GameCreate(TMessage, tag="newgame"):
    class Payload(msgspec.Struct):
        white_player: str | None = msgspec.field(name="wp", default=None)
        black_player: str | None = msgspec.field(name="bp", default=None)

    data: Payload | None = msgspec.field(name="d", default_factory=Payload)


class GameMove(TMessage, tag="move"):
    class Move(msgspec.Struct):
        san: str

    data: Move = msgspec.field(name="d")


type Protocol = GameCreate | GameMove
