from typing import Self

from pydantic import model_validator

from app.api.schemas import BaseSchema
from core.db.models.pref import Board, PieceSet


# In
class PreferenceUpdate(BaseSchema):
    board: Board | None = None
    pieceset: PieceSet | None = None

    @model_validator(mode="after")
    def check_not_empty(self) -> Self:
        if not self.model_fields_set:
            raise ValueError("At least one field must be provided")
        return self


# Out
class Preference(BaseSchema):
    board: Board = Board.WOOD
    pieceset: PieceSet = PieceSet.BASE
