from enum import StrEnum
from typing import TYPE_CHECKING, Optional
from uuid import UUID

from sqlalchemy import JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db.types import GameId8, PrimaryKey, TimestampNow

from .base import Base

if TYPE_CHECKING:
    from .user import User


class GameStatus(StrEnum):
    CREATED = "CREATED"
    CANCELLED = "CANCELED"
    COMPLETED = "COMPLETED"
    PENDING = "PENDING"


class Game(Base):
    __tablename__ = "game"

    id: Mapped[PrimaryKey[int]]
    game_id: Mapped[GameId8]
    white_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("user_account.id", ondelete="SET NULL")
    )
    black_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("user_account.id", ondelete="SET NULL")
    )
    status: Mapped[GameStatus] = mapped_column(default=GameStatus.CREATED)
    pub_date: Mapped[TimestampNow]
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    white: Mapped[Optional["User"]] = relationship(foreign_keys=[white_id])
    black: Mapped[Optional["User"]] = relationship(foreign_keys=[black_id])
