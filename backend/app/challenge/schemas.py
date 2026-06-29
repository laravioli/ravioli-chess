from pydantic import UUID4

from app.api.schemas import BaseSchema
from ravioli_core.db.enums import ChessColorChoice


class ChallengeNotif(BaseSchema):
    challenge_id: str
    sender_id: UUID4
    receiver_id: UUID4
    color_choice: ChessColorChoice
    time_control: str
