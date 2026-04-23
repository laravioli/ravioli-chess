from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ravioli_service.db.types import PrimaryKey

from .base import Base

if TYPE_CHECKING:
    from .user import User


class Board(StrEnum):
    WOOD = "wood"
    BLUE = "blue"
    BLUE2 = "blue2"
    BROWN = "brown"


class PieceSet(StrEnum):
    BASE = "base"
    WIKI = "wiki"


class Preference(Base):
    __tablename__ = "user_preference"

    id: Mapped[PrimaryKey[int]]
    board: Mapped[Board] = mapped_column(default=Board.BLUE)
    pieceset: Mapped[PieceSet] = mapped_column(default=PieceSet.BASE)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("user_account.id", ondelete="CASCADE"), unique=True
    )
    user: Mapped["User"] = relationship(back_populates="preference")
