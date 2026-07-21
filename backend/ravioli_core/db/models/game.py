from enum import StrEnum
from typing import TYPE_CHECKING, Optional
from uuid import UUID

from sqlalchemy import JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ravioli_core.db.types import GameId8, PrimaryKey, TimestampNow

from .base import Base

if TYPE_CHECKING:
    from .user import SA_User


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
    status: Mapped[GameStatus] = mapped_column(default=GameStatus.CREATED)
    pub_date: Mapped[TimestampNow]
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    moves: Mapped[str | None]  # uncompressed format
    clock: Mapped[str | None]  # uncompressed format
    white: Mapped[Optional["SA_User"]] = relationship(foreign_keys=[white_id])
    black: Mapped[Optional["SA_User"]] = relationship(foreign_keys=[black_id])
