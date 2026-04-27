from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ravioli_service.db.types import TimestampNow

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
    unread: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[TimestampNow]


class FriendRequest(Notification):
    __mapper_args__ = {
        "polymorphic_identity": "friend_request",
        "polymorphic_load": "inline",
    }

    friendship_id: Mapped[int | None] = mapped_column(
        ForeignKey("friendship.id", ondelete="CASCADE")
    )
    friendship: Mapped["Friendship"] = relationship(lazy="raise")


# NOTE that the mappers for the derived classes Manager and Engineer omit the __tablename__,
# NOTE indicating they do not have a mapped table of their own.
# NOTE Additionally, a mapped_column() directive with nullable=True is included;
# NOTE as the Python types declared for these classes do not include Optional[],
# NOTE the column would normally be mapped as NOT NULL,
# NOTE which would not be appropriate as
# NOTE this column only expects to be populated for those rows that correspond to that particular subclass.
