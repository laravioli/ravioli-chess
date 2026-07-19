from enum import StrEnum

from piccolo.columns.base import OnDelete, OnUpdate
from piccolo.columns.column_types import JSON, ForeignKey, Serial, Timestamptz, Varchar
from piccolo.columns.defaults.timestamptz import TimestamptzNow
from piccolo.table import Table

from .user import User


class Game(Table, tablename="game"):
    class Status(StrEnum):
        CREATED = "created"
        STARTED = "started"
        ABORTED = "aborted"
        MATE = "mate"
        RESIGN = "resign"
        STALEMATE = "stalemate"
        TIMEOUT = "timeout"
        DRAW = "draw"
        NOSTART = "nostart"

    id = Serial(primary_key=True)
    game_id = Varchar(length=8, default=None, unique=True)
    white_player = ForeignKey(
        references=User,
        db_column_name="white_id",
        null=True,
        index=True,
        on_delete=OnDelete.set_null,
        on_update=OnUpdate.no_action,
    )
    black_player = ForeignKey(
        references=User,
        db_column_name="black_id",
        null=True,
        index=True,
        on_delete=OnDelete.set_null,
        on_update=OnUpdate.no_action,
    )
    status = Varchar(length=20, choices=Status, default=None)
    pub_date = Timestamptz(default=TimestamptzNow())
    meta = JSON(default="{}", null=False)
    moves = Varchar(length=None, default=None, null=True)
    clock = Varchar(length=None, default=None, null=True)
