from msgspec import Struct, field

# ╔══════════════════════════════════════╗
# ║   CLIENT OUT : ws <- client          ║
# ╚══════════════════════════════════════╝


# TODO: add validation
# Data
class GameInfo(Struct):
    white_player: str | None = field(name="wp", default=None)
    black_player: str | None = field(name="bp", default=None)


class MoveData(Struct):
    san: str


# Frame
class ClientOUT(Struct, tag_field="t", rename={"data": "d"}): ...


class GameCreate(ClientOUT, tag="newGame"):
    data: GameInfo = field(default_factory=GameInfo)


class GameMove(ClientOUT, tag="move"):
    data: MoveData


# types
type ClientFrameOut = GameCreate | GameMove
