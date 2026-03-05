from sqlalchemy.orm import Mapped, mapped_column

from app.db.models import Base
from app.db.types import PrimaryKey


class ChessPosition(Base):
    __tablename__ = "chess_position"

    id: Mapped[PrimaryKey[int]]
    eco: Mapped[str] = mapped_column(unique=True)
    name: Mapped[str]
    fen: Mapped[str]
