from ..structs import GameRouting, TaggedMsg

# ╔══════════════════════════════════════╗
# ║   CLIENT IN : ws -> client           ║
# ╚══════════════════════════════════════╝


class GameCreate(TaggedMsg, tag="game.created"):
    data: GameRouting
