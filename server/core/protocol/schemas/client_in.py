import msgspec

from .base_schemas import Frame

# ╔══════════════════════════════════════╗
# ║   CLIENT IN : ws -> client           ║
# ╚══════════════════════════════════════╝


class GameCreate(Frame, tag="gamecreated"):
    class Payload(msgspec.Struct):
        game_id: str

    data: Payload = msgspec.field(name="d")


type Protocol = GameCreate
