from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db.types import TimestampNow

from .base import Base

if TYPE_CHECKING:
    from .social import Friendship


class Notification(Base):
    __tablename__ = "notification"
    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": "notification",
    }

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(String(50))
    user_id: Mapped[int] = mapped_column(ForeignKey("user_account.id", ondelete="CASCADE"))
    created_at: Mapped[TimestampNow]


class FriendRequest(Notification):
    __mapper_args__ = {
        "polymorphic_identity": "friend_request",
    }

    friendship_id: Mapped[int | None] = mapped_column(
        ForeignKey("friendship.id", ondelete="CASCADE")
    )
    friendship: Mapped["Friendship"] = relationship(lazy="raise")
