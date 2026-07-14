from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import CheckConstraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ravioli_core.db.types import (
    ChallengeId8,
    ExpireAfter1Week,
    Fen,
    PrimaryKey,
    TimeControl,
    TimestampNow,
)

from ..enums import ChessColor, ChessColorChoice
from .base import Base

if TYPE_CHECKING:
    from .user import SA_User

INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"


class ChallengeStatus(StrEnum):
    CREATED = "created"
    CANCELED = "canceled"
    DECLINED = "declined"
    ACCEPTED = "accepted"


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
    color: Mapped[ChessColor]
    initial_fen: Mapped[Fen] = mapped_column(default=INITIAL_FEN)
    pub_date: Mapped[TimestampNow]
    expire_at: Mapped[ExpireAfter1Week]
    time_control: Mapped[TimeControl]  # todo write something that make sense for timecontrol
    sender: Mapped["SA_User"] = relationship(foreign_keys=[sender_id])
    receiver: Mapped["SA_User"] = relationship(foreign_keys=[receiver_id])

    __table_args__ = (
        CheckConstraint(
            "sender_id IS NOT NULL OR receiver_id IS NULL",
            name="challenge_sender_required_for_receiver",
        ),
        CheckConstraint(
            "sender_id <> receiver_id",
            name="challenge_no_self_challenge",
        ),
    )
