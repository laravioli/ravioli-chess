from piccolo.columns.column_types import Serial, Varchar
from piccolo.table import Table


class ChessPosition(Table, tablename="chess_position"):
    id = Serial(primary_key=True)
    eco = Varchar(default=None, unique=True)
    name = Varchar(default=None)
    fen = Varchar(default=None)
