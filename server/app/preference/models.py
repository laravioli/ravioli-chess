from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import PrimaryKey

from .enums import Board, PieceSet

if TYPE_CHECKING:
    from app.user.models import User


class Preference(Base):
    __tablename__ = "user_preference"

    id: Mapped[PrimaryKey[int]]
    board: Mapped[Board] = mapped_column(default=Board.WOOD)
    pieceset: Mapped[PieceSet] = mapped_column(default=PieceSet.BASE)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user_account.id", ondelete="CASCADE"), unique=True
    )
    user: Mapped["User"] = relationship(back_populates="preference")
