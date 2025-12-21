import enum
from typing import TYPE_CHECKING

from app.db.base import Base
from app.db.types import PrimaryKey
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.auth.models import User


class Board(str, enum.Enum):
    WOOD = "wood"
    BLUE = "blue"
    BLUE2 = "blue2"
    BROWN = "brown"


class PieceSet(str, enum.Enum):
    BASE = "base"
    WIKI = "wiki"


class Preference(Base):
    __tablename__ = "user_preference"

    id: Mapped[PrimaryKey[int]]
    board: Mapped[Board] = mapped_column(default=Board.WOOD)
    pieceset: Mapped[PieceSet] = mapped_column(default=PieceSet.BASE)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user_account.id", ondelete="CASCADE"), unique=True
    )
    user: Mapped["User"] = relationship(back_populates="preference")
