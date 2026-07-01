import random
from enum import StrEnum


class ChessColorChoice(StrEnum):
    RANDOM = "rand"
    WHITE = "w"
    BLACK = "b"


class ChessColor(StrEnum):
    WHITE = "w"
    BLACK = "b"

    @classmethod
    def from_choice(cls, choice: ChessColorChoice) -> "ChessColor":
        if choice is ChessColorChoice.RANDOM:
            return random.choice((cls.WHITE, cls.BLACK))
        return cls(choice.value)
