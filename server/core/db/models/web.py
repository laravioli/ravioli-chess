from sqlalchemy.orm import Mapped, mapped_column

from core.db.types import PrimaryKey

from .base import Base


class ChessPosition(Base):
    __tablename__ = "chess_position"

    id: Mapped[PrimaryKey[int]]
    eco: Mapped[str] = mapped_column(unique=True)
    name: Mapped[str]
    fen: Mapped[str]
