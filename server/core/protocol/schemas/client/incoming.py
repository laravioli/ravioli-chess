from ..base import TaggedMsg
from ..data import GameRouting

# ╔══════════════════════════════════════╗
# ║   CLIENT IN : ws -> client           ║
# ╚══════════════════════════════════════╝


class GameCreate(TaggedMsg, tag="game.created"):
    data: GameRouting
