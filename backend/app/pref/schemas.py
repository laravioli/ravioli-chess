from typing import Self

from pydantic import BaseModel, ConfigDict, model_validator

from app.api.schemas import BaseSchema
from ravioli_core.db.models.pref import Board, PieceSet


class PreferenceUpdate(BaseSchema):
    model_config = ConfigDict(use_enum_values=True, extra="forbid")

    board: Board | None = None
    pieceset: PieceSet | None = None

    @model_validator(mode="after")
    def check_not_empty(self) -> Self:
        if not self.model_fields_set:
            raise ValueError("At least one field must be provided")
        return self

    def to_dict(self):
        return self.model_dump(exclude_unset=True)


class PreferenceOut(BaseModel):
    board: Board = Board.BLUE
    pieceset: PieceSet = PieceSet.BASE
