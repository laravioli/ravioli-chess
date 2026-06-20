from dataclasses import dataclass

from app.types import GameId, UserId


@dataclass(slots=True, frozen=True)
class NewGame:
    id: GameId | None = None
    white_player: UserId | None = None
    black_player: UserId | None = None


@dataclass(slots=True, frozen=True)
class GameWithId:
    id: GameId
    white_player: UserId | None = None
    black_player: UserId | None = None
