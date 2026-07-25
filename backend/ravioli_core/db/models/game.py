from enum import StrEnum
from uuid import UUID

from sqlalchemy import JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from ravioli_core.db.types import GameId8, PrimaryKey, TimestampNow

from .base import Base


class GameStatus(StrEnum):
    CREATED = "created"
    STARTED = "started"
    ABORTED = "aborted"
    MATE = "mate"
    RESIGN = "resign"
    STALEMATE = "stalemate"
    TIMEOUT = "timeout"
    DRAW = "draw"
    NOSTART = "nostart"


class Game(Base):
    __tablename__ = "game"

    id: Mapped[PrimaryKey[int]]
    game_id: Mapped[GameId8]
    white_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("user_account.id", ondelete="SET NULL"), index=True
    )
    black_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("user_account.id", ondelete="SET NULL"), index=True
    )
    status: Mapped[GameStatus] = mapped_column(server_default=GameStatus.CREATED)
    pub_date: Mapped[TimestampNow]
    meta: Mapped[dict] = mapped_column(JSON, server_default="{}")
    moves: Mapped[str | None]  # uncompressed format
    clock: Mapped[str | None]  # uncompressed format
