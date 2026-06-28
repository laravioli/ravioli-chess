from enum import IntEnum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ravioli_core.db.types import ChallengeId8, PrimaryKey, TimestampNow

from .base import Base
from .enums import ChessColor, ChessColorChoice

if TYPE_CHECKING:
    from .user import User


class ChallengeStatus(IntEnum):
    CREATED = 1
    CANCELED = 2
    DECLINED = 3
    ACCEPTED = 4


class Challenge(Base):
    __tablename__ = "challenge"

    id: Mapped[PrimaryKey[int]]
    challenge_id: Mapped[ChallengeId8]
    sender_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("user_account.id", ondelete="SET NULL"), index=True
    )
    receiver_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("user_account.id", ondelete="SET NULL"), index=True
    )
    status: Mapped[ChallengeStatus] = mapped_column(default=ChallengeStatus.CREATED)
    color_choice: Mapped[ChessColorChoice]
    color: Mapped[ChessColor | None]
    pub_date: Mapped[TimestampNow]
    time_control: Mapped[str]  # todo write something that make sense for timecontrol
    sender: Mapped["User"] = relationship(foreign_keys=[sender_id])
    receiver: Mapped["User"] = relationship(foreign_keys=[receiver_id])
