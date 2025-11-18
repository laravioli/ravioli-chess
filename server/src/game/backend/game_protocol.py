import msgspec


class Move(msgspec.Struct):
    san: str
