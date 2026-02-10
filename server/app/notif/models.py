from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models import Base
from app.db.types import TimestampNow

if TYPE_CHECKING:
    from app.social.models import Friendship


class Notification(Base):
    __tablename__ = "notification"
    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(String(50))
    recipient_id: Mapped[int] = mapped_column(ForeignKey("user_account.id", ondelete="CASCADE"))
    created_at: Mapped[TimestampNow]

    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": "notification",
    }


class FriendRequest(Notification):
    friendship_id: Mapped[int] = mapped_column(
        ForeignKey("friendship.id", ondelete="CASCADE"), nullable=True
    )
    friendship: Mapped["Friendship"] = relationship(lazy="raise")

    __mapper_args__ = {
        "polymorphic_identity": "friend_request",
    }
