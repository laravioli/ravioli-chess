from typing import Annotated

from pydantic import ConfigDict, Field, StringConstraints

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


class ChallengeNotif(BaseSchema):
    model_config = ConfigDict(use_enum_values=True)

    id: str = Field(validation_alias="challenge_id")
    status: ChallengeStatus
    sender: UserBase
    receiver: UserBase
    color_choice: ChessColorChoice
    final_color: ChessColor = Field(validation_alias="color")
    time_control: TimeControl
    initial_fen: str
