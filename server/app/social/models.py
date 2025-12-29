from typing import Literal

from sqlalchemy import Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.types import TimestampUpdated

Status = Literal["pending", "accepted", "blocked"]


class Friendship(Base):
    __tablename__ = "friendship"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user_account.id", ondelete="CASCADE"))
    friend_id: Mapped[int] = mapped_column(ForeignKey("user_account.id", ondelete="CASCADE"))
    status: Mapped[Status] = mapped_column(
        Enum("pending", "accepted", "blocked", name="friendship_enum"), default="pending"
    )
    last_update: Mapped[TimestampUpdated]

    __table_args__ = (UniqueConstraint("user_id", "friend_id"),)
