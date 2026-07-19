from enum import StrEnum

from piccolo.columns.column_types import ForeignKey, Serial, Varchar
from piccolo.table import Table

from .user import User


class Preference(Table, tablename="user_preference"):
    class Board(StrEnum):
        WOOD = "wood"
        BLUE = "blue"
        BLUE2 = "blue2"
        BROWN = "brown"

    class PieceSet(StrEnum):
        BASE = "base"
        WIKI = "wiki"

    id = Serial(primary_key=True)
    board = Varchar(length=20, choices=Board, default=None)
    pieceset = Varchar(length=20, choices=PieceSet, default=None)
    user = ForeignKey(
        references=User, null=False, unique=True, db_column_name="user_id"
    )
