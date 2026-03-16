from ..base import TaggedMsg
from ..data import GameRouting, GameStop, ValidatedMove

# ╔══════════════════════════════════════╗
# ║   ENGINE OUT : ws <- engine          ║
# ╚══════════════════════════════════════╝


# note : redefine tag in case of client forwarding


class GameCreate(TaggedMsg, tag="game.create"):
    data: GameRouting


class GameMove(TaggedMsg, tag="game.move"):
    data: ValidatedMove


class GameEnd(TaggedMsg, tag="game.end"):
    data: GameStop


type GameStart = GameCreate

type GameProtocol = GameMove | GameEnd

type Protocol = GameStart | GameProtocol
