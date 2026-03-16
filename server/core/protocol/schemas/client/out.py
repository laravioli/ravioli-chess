import msgspec

from ..base import TaggedMsg
from ..data import GameInfo, MoveData

# ╔══════════════════════════════════════╗
# ║   CLIENT OUT : ws <- client          ║
# ╚══════════════════════════════════════╝


class GameCreate(TaggedMsg, tag="game.new"):
    data: GameInfo = msgspec.field(default_factory=GameInfo)


class GameMove(TaggedMsg, tag="game.move"):
    data: MoveData


type Protocol = GameCreate | GameMove
