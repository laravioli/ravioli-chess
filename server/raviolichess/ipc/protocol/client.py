import msgspec
from typing import Optional
from ipc.protocol.game import GameCreateOut

###-#-#-#-#-#-#-#-#-#-#-#-#-#-###
# PROTOCOL                      #
# request:   ws <- client       #
# response:  ws -> client       #
###-#-#-#-#-#-#-#-#-#-#-#-#-#-###


class TMessage(msgspec.Struct, tag_field="t"): ...


class GameCreateRequest(TMessage, tag="newgame"):
    class Payload(msgspec.Struct):
        white_player: Optional[str] = msgspec.field(name="wp", default=None)
        black_player: Optional[str] = msgspec.field(name="bp", default=None)

    data: Optional[Payload] = msgspec.field(default_factory=Payload)


GameCreateResponse = GameCreateOut


class GameMoveRequest(TMessage, tag="move"):
    class Move(msgspec.Struct):
        san: str

    data: Move
