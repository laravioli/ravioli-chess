from app.api.schemas import BaseSchema

from .enums import Board, PieceSet


# Out
class Preference(BaseSchema):
    board: Board = Board.WOOD
    pieceset: PieceSet = PieceSet.BASE
