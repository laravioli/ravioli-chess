import msgspec

from .base_schemas import Msg

# ╔══════════════════════════════════════╗
# ║   ENGINE OUT : ws <- engine          ║
# ╚══════════════════════════════════════╝


class GameCreate(Msg, tag="game_create"):
    class Payload(msgspec.Struct):
        game_id: str

    data: Payload


class GameMove(Msg, tag="game_move"):
    class Payload(msgspec.Struct):
        ok: bool
        san: str

    data: Payload


class GameEnd(Msg, tag="game_end"):
    class Payload(msgspec.Struct):
        reason: str

    data: Payload


type GameStart = GameCreate

type GameProtocol = GameMove | GameEnd

type Protocol = GameStart | GameProtocol
