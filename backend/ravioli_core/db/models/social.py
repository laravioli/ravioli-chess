import uuid
from enum import StrEnum

from sqlalchemy import CheckConstraint, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column

from ravioli_core.db.types import TimestampUpdated

from .base import Base


class FriendshipStatus(StrEnum):
    pending = "pending"
    accepted = "accepted"
    blocked = "blocked"


class Friendship(Base):
    __tablename__ = "friendship"

    id: Mapped[int] = mapped_column(primary_key=True)
    sender_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_account.id", ondelete="CASCADE"))
    receiver_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user_account.id", ondelete="CASCADE")
    )
    status: Mapped[FriendshipStatus] = mapped_column(default=FriendshipStatus.pending)
    last_update: Mapped[TimestampUpdated]

    __table_args__ = (
        Index(
            "ix_unique_friendship",
            func.least(sender_id, receiver_id),
            func.greatest(sender_id, receiver_id),
            unique=True,
        ),
        CheckConstraint(sender_id != receiver_id, name="ck_user_not_friend_with_self"),
    )
