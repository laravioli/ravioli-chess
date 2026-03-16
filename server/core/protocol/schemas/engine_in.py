from ._base import TaggedMsg
from ._data import GameInfo

# ╔══════════════════════════════════════╗
# ║   ENGINE IN : ws -> engine           ║
# ╚══════════════════════════════════════╝


class GameCreate(TaggedMsg):
    channel: str
    data: GameInfo


class ChallengeAccepted(TaggedMsg):
    id: str
    data: GameInfo


class GameResign(TaggedMsg):
    player: str


# Forwarded Msg

from .client_out import GameMove  # noqa: E402

# Protocol

type GameStart = GameCreate | ChallengeAccepted

type GameProtocol = GameMove | GameResign

type Protocol = GameStart | GameProtocol
