from enum import StrEnum

from piccolo.columns.column_types import ForeignKey, Serial, Timestamptz, Varchar
from piccolo.columns.defaults.timestamptz import TimestamptzNow
from piccolo.table import Table

from .user import User


class Friendship(Table, tablename="friendship"):
    class Status(StrEnum):
        pending = "pending"
        accepted = "accepted"
        blocked = "blocked"

    id = Serial(primary_key=True)
    sender = ForeignKey(
        references=User,
        db_column_name="sender_id",
        null=False,
        index=True,
    )
    receiver = ForeignKey(
        references=User,
        db_column_name="receiver_id",
        null=False,
        index=True,
    )
    status = Varchar(length=20, choices=Status, default=None)
    last_update = Timestamptz(default=TimestamptzNow())
