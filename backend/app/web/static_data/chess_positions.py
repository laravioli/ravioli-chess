from functools import cached_property
from typing import TypedDict

from ravioli_core.serializers import json


class ChessPosition(TypedDict):
    eco: str
    name: str
    fen: str


class Positions:
    @cached_property
    def all(self):
        return [
            ChessPosition(
                eco="C45",
                name="Scotch Game",
                fen="r1bqkbnr/pppp1ppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4",
            )
        ]

    @cached_property
    def json(self):
        return json.encode(self.all)


positions = Positions()
