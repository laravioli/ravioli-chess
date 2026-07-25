from uuid import UUID

from msgspec import Struct

from ravioli_core.db.enums import ChessColor, ChessColorChoice
from ravioli_core.db.models.challenge import ChallengeStatus


class Challenge(Struct, frozen=True):
    challenge_id: str
    sender_id: UUID | None
    receiver_id: UUID | None
    color_choice: ChessColorChoice
    color: ChessColor
    status: ChallengeStatus = ChallengeStatus.CREATED
    initial_fen: str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    time_control: str | None = None
