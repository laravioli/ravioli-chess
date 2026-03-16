import msgspec

from ._base import TaggedMsg
from ._data import GameInfo, MoveData

# ╔══════════════════════════════════════╗
# ║   CLIENT OUT : ws <- client          ║
# ╚══════════════════════════════════════╝


class GameCreate(TaggedMsg, tag="game.new"):
    data: GameInfo = msgspec.field(default_factory=GameInfo)


class GameMove(TaggedMsg, tag="game.move"):
    data: MoveData


type Protocol = GameCreate | GameMove
