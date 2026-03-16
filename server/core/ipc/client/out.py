import msgspec

from ..structs import GameInfo, MoveData, TaggedMsg

# ╔══════════════════════════════════════╗
# ║   CLIENT OUT : ws <- client          ║
# ╚══════════════════════════════════════╝


class GameCreate(TaggedMsg, tag="game.new"):
    data: GameInfo = msgspec.field(default_factory=GameInfo)


class GameMove(TaggedMsg, tag="game.move"):
    data: MoveData


type Protocol = GameCreate | GameMove
