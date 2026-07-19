from piccolo.columns.base import OnDelete, OnUpdate
from piccolo.columns.column_types import (
    Boolean,
    ForeignKey,
    Serial,
    Timestamptz,
    Varchar,
)
from piccolo.columns.defaults.timestamptz import TimestamptzNow
from piccolo.table import Table

from .social import Friendship
from .user import User


class Notification(Table, tablename="notification"):
    id = Serial(primary_key=True)
    type = Varchar(length=50, default=None)
    created_at = Timestamptz(default=TimestamptzNow())
    friendship = ForeignKey(
        references=Friendship,
        on_delete=OnDelete.cascade,
        on_update=OnUpdate.no_action,
        db_column_name="friendship_id",
    )
    read = Boolean(default=False)
    sender = ForeignKey(
        references=User,
        db_column_name="sender_id",
        null=False,
        index=True,
        on_delete=OnDelete.cascade,
        on_update=OnUpdate.no_action,
    )
    receiver = ForeignKey(
        references=User,
        db_column_name="receiver_id",
        null=False,
        index=True,
        on_delete=OnDelete.cascade,
        on_update=OnUpdate.no_action,
    )
