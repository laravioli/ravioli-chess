import random
from enum import StrEnum

from piccolo.columns import Varchar


class ChessColorChoice(StrEnum):
    RANDOM = "rand"
    WHITE = "w"
    BLACK = "b"

    @classmethod
    def db_column(cls):
        return Varchar(length=4, choices=cls, default=None)


class ChessColor(StrEnum):
    WHITE = "w"
    BLACK = "b"

    @classmethod
    def from_choice(cls, choice: ChessColorChoice) -> "ChessColor":
        if choice is ChessColorChoice.RANDOM:
            return random.choice((cls.WHITE, cls.BLACK))
        return cls(choice.value)

    @classmethod
    def db_column(cls):
        return Varchar(length=1, choices=cls, default=None)
