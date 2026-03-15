import msgspec

from .base_schemas import Frame

# ╔══════════════════════════════════════╗
# ║   CLIENT OUT : ws <- client          ║
# ╚══════════════════════════════════════╝


class GameCreate(Frame, tag="newgame"):
    class Payload(msgspec.Struct):
        white_player: str | None = msgspec.field(name="wp", default=None)
        black_player: str | None = msgspec.field(name="bp", default=None)

    data: Payload | None = msgspec.field(name="d", default_factory=Payload)


class GameMove(Frame, tag="move"):
    class Move(msgspec.Struct):
        san: str

    data: Move = msgspec.field(name="d")


type Protocol = GameCreate | GameMove
