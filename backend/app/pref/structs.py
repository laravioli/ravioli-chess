from msgspec import Struct, structs

from ravioli_core.db.models.pref import Board, PieceSet

from .schemas import PreferenceUpdate


class Preference(Struct, frozen=True):
    board: Board = Board.BLUE
    pieceset: PieceSet = PieceSet.BASE

    def update(self, patch: PreferenceUpdate):
        return structs.replace(self, **patch.model_dump())

    @property
    def to_html_attrs(self):
        return f'data-board="{self.board.value}" data-pieceset="{self.pieceset.value}"'
