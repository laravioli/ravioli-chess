from typing import Annotated

from pydantic import UUID4, StringConstraints

from app.api.schemas import BaseSchema
from ravioli_core.db.enums import ChessColorChoice

type TimeControl = Annotated[
    str,
    StringConstraints(pattern=r"^\d{1,3}\+\d{1,3}$"),
]


class ChallengeRequest(BaseSchema):
    color_choice: ChessColorChoice
    time_control: TimeControl | None = None


class ChallengeNotif(BaseSchema):
    challenge_id: str
    sender_id: UUID4
    receiver_id: UUID4
    color_choice: ChessColorChoice
    time_control: TimeControl
