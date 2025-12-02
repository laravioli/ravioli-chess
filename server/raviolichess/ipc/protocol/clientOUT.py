import msgspec
from typing import Optional, Union

# ╔══════════════════════════════════════╗
# ║   PROTOCOL OUT : client -> ws        ║
# ╚══════════════════════════════════════╝


class TMessage(msgspec.Struct, tag_field="t"): ...


class GameCreate(TMessage, tag="newgame"):
    class Payload(msgspec.Struct):
        white_player: Optional[str] = msgspec.field(name="wp", default=None)
        black_player: Optional[str] = msgspec.field(name="bp", default=None)

    data: Optional[Payload] = msgspec.field(name="d", default_factory=Payload)


class GameMove(TMessage, tag="move"):
    class Move(msgspec.Struct):
        san: str

    data: Move = msgspec.field(name="d")


Protocol = Union[GameCreate, GameMove]
