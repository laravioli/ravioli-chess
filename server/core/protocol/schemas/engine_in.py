from .base_schemas import Msg
from .payload import GameInfo

# ╔══════════════════════════════════════╗
# ║   ENGINE IN : ws -> engine           ║
# ╚══════════════════════════════════════╝


class GameCreate(Msg, tag="game_create"):
    channel: str
    payload: GameInfo


class ChallengeAccepted(Msg, tag="challenge_accepted"):
    id: str
    payload: GameInfo


class GameMove(Msg, tag="game_move"):
    san: str


class GameResign(Msg, tag="game_resign"):
    player: str


type GameStart = GameCreate | ChallengeAccepted

type GameProtocol = GameMove | GameResign

type Protocol = GameStart | GameProtocol
