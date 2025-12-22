import enum


class Board(str, enum.Enum):
    WOOD = "wood"
    BLUE = "blue"
    BLUE2 = "blue2"
    BROWN = "brown"


class PieceSet(str, enum.Enum):
    BASE = "base"
    WIKI = "wiki"
