from typing import NotRequired, Self, TypedDict

from pydantic import BaseModel, model_validator

from app.api.schemas import BaseSchema
from ravioli_core.db.models.pref import Board, PieceSet


class PreferenceUpdate(BaseSchema):
    board: Board | None = None
    pieceset: PieceSet | None = None

    @model_validator(mode="after")
    def check_not_empty(self) -> Self:
        if not self.model_fields_set:
            raise ValueError("At least one field must be provided")
        return self


class Preference(BaseModel):
    board: Board = Board.BLUE
    pieceset: PieceSet = PieceSet.BASE

    def update(self, patch: PreferenceUpdate):
        return self.model_copy(update=patch.model_dump(exclude_none=True))

    @property
    def html_attrs(self):
        return f'data-board="{self.board.value}" data-pieceset="{self.pieceset.value}"'


class CookiePreference(TypedDict):
    board: NotRequired[Board]
    pieceset: NotRequired[PieceSet]
