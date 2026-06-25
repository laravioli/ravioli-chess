from enum import IntEnum
from typing import TYPE_CHECKING, Optional
from uuid import UUID

from sqlalchemy import JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ravioli_core.db.types import GameId8, PrimaryKey, TimestampNow

from .base import Base

if TYPE_CHECKING:
    from .user import User


class Status(IntEnum):
    CREATED = 1
    STARTED = 2
    ABORTED = 3
    MATE = 4
    RESIGN = 5
    STALEMATE = 6
    TIMEOUT = 7
    DRAW = 8
    NOSTART = 9


# update db
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
    status: Mapped[Status] = mapped_column(default=Status.CREATED)
    pub_date: Mapped[TimestampNow]
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    moves: Mapped[bytes | None]
    clock: Mapped[bytes | None] = mapped_column(JSON, nullable=True)
    white: Mapped[Optional["User"]] = relationship(foreign_keys=[white_id])
    black: Mapped[Optional["User"]] = relationship(foreign_keys=[black_id])
