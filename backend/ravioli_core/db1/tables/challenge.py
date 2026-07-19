from enum import StrEnum

from piccolo.columns.base import OnDelete
from piccolo.columns.column_types import ForeignKey, Serial, Timestamptz, Varchar
from piccolo.columns.defaults.timestamptz import TimestamptzNow, TimestamptzOffset
from piccolo.table import Table

from ..enums import ChessColor, ChessColorChoice
from .user import User


class Challenge(Table, tablename="challenge"):
    class Status(StrEnum):
        CREATED = "created"
        CANCELED = "canceled"
        DECLINED = "declined"
        ACCEPTED = "accepted"

    id = Serial(primary_key=True)
    challenge_id = Varchar(length=8, default=None, index=True)
    sender = ForeignKey(
        references=User,
        db_column_name="sender_id",
        null=True,
        index=True,
        on_delete=OnDelete.set_null,
    )
    receiver = ForeignKey(
        references=User,
        db_column_name="receiver_id",
        null=True,
        index=True,
        on_delete=OnDelete.set_null,
    )
    status = Varchar(length=20, choices=Status, default=None)
    color_choice = ChessColorChoice.db_column()
    color = ChessColor.db_column()
    initial_fen = Varchar(length=100, default=None)
    pub_date = Timestamptz(default=TimestamptzNow())
    expire_at = Timestamptz(default=TimestamptzOffset(days=7), index=True)
    time_control = Varchar(length=10, default=None, null=True)
