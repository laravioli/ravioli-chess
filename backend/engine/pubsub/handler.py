from typing import TYPE_CHECKING

from ravioli_core.ipc import e_in
from ravioli_core.serializers import json

if TYPE_CHECKING:
    from engine.game import Games


def make_handler(games: "Games"):
    type GameMsg = e_in.GameUpdate | e_in.GameStart

    def handle(_, data: bytes):
        msg = json.decode(data, type_arg=GameMsg)
        match msg:
            case e_in.GameMove() | e_in.GameResign():
                games.publish_one(msg.game_id, msg)
            case e_in.GameStart():
                games.start_game(msg)

    return handle
