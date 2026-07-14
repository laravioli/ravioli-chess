from dataclasses import dataclass, field

from sqlalchemy import RowMapping

from ravioli_core.db.models.pref import Board, PieceSet


@dataclass(slots=True, frozen=True)
class Preference:
    board: Board = field(default=Board.BLUE)
    pieceset: PieceSet = field(default=PieceSet.BASE)

    @staticmethod
    def from_row(row: RowMapping):
        return Preference(board=row["board"], pieceset=row["pieceset"])

    @property
    def html_attrs(self):
        return f'data-board="{self.board.value}" data-pieceset="{self.pieceset.value}"'
