from dataclasses import dataclass

from sqlalchemy import RowMapping

from ravioli_core.db.models.pref import Board, PieceSet


@dataclass(slots=True, frozen=True)
class Preference:
    board: Board
    pieceset: PieceSet

    @staticmethod
    def from_row(row: RowMapping):
        return Preference(board=row["board"], pieceset=row["pieceset"])

    @staticmethod
    def default():
        return Preference(board=Board.BLUE, pieceset=PieceSet.BASE)
