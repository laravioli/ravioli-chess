import uuid
from typing import Literal

from sqlalchemy import CheckConstraint, Enum, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.models import Base
from app.db.types import TimestampUpdated

type Status = Literal["pending", "accepted", "blocked"]


class Friendship(Base):
    __tablename__ = "friendship"

    id: Mapped[int] = mapped_column(primary_key=True)
    sender_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_account.id", ondelete="CASCADE"))
    receiver_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user_account.id", ondelete="CASCADE")
    )
    status: Mapped[Status] = mapped_column(
        Enum("pending", "accepted", "blocked", name="friendship_enum"), default="pending"
    )
    last_update: Mapped[TimestampUpdated]

    __table_args__ = (
        Index(
            "ix_unique_friendship",
            func.least("sender_id", "receiver_id"),
            func.greatest("sender_id", "receiver_id"),
            unique=True,
        ),
        CheckConstraint("sender_id != receiver_id", name="ck_user_not_friend_with_self"),
    )
