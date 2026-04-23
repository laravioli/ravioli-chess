from msgspec import UNSET, Raw, Struct

# ╔══════════════════════════════════════╗
# ║   CLIENT IN : ws -> client           ║
# ╚══════════════════════════════════════╝


# Frame
class ClientIn(Struct, rename={"type": "t", "data": "d"}):
    type: str
    data: Raw | None = UNSET
