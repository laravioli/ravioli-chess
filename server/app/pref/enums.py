from enum import Enum


class Board(str, Enum):
    WOOD = "wood"
    BLUE = "blue"
    BLUE2 = "blue2"
    BROWN = "brown"


class PieceSet(str, Enum):
    BASE = "base"
    WIKI = "wiki"
