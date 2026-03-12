from __future__ import annotations

import msgspec

# ╔══════════════════════════════════════╗
# ║   PROTOCOL IN : ravio <- ws          ║
# ╚══════════════════════════════════════╝


class TMsg(msgspec.Struct, tag_field="t", tag=str.lower):
    pass


class GameCreate(TMsg):
    channel: str
    white_player: str | None = msgspec.field(name="wp", default=None)
    black_player: str | None = msgspec.field(name="bp", default=None)


class ChallengeAccepted(TMsg, tag="caccept"):
    id: str
    white_player: str = msgspec.field(name="wp")
    black_player: str = msgspec.field(name="bp")


class GameMove(TMsg):
    san: str


class GameResign(TMsg):
    player: str


type GameStart = GameCreate | ChallengeAccepted
type GameProtocol = GameMove | GameResign
