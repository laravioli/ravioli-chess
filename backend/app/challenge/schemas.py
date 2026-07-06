from enum import StrEnum
from typing import Annotated

from pydantic import ConfigDict, StringConstraints

from app.api.schemas import BaseSchema
from app.user.schemas import UserBase
from ravioli_core.db.enums import ChessColor, ChessColorChoice
from ravioli_core.db.models import ChallengeStatus

type TimeControl = Annotated[
    str,
    StringConstraints(pattern=r"^\d{1,3}\+\d{1,3}$"),
]


class ChallengeRequest(BaseSchema):
    color_choice: ChessColorChoice
    time_control: TimeControl | None = None


class Direction(StrEnum):
    IN = "in"
    OUT = "out"


class ChallengeNotif(BaseSchema):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    status: ChallengeStatus
    sender: UserBase
    receiver: UserBase
    color_choice: ChessColorChoice
    final_color: ChessColor
    time_control: TimeControl
    initial_fen: str
    direction: Direction
