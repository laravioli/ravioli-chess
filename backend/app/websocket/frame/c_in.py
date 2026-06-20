from msgspec import UNSET, Raw, Struct

# ╔══════════════════════════════════════╗
# ║    CLIENT <- WEBSOCKET               ║
# ╚══════════════════════════════════════╝


# ╔══════════════════════════════════════╗
# ║    FRAME                             ║
# ╚══════════════════════════════════════╝


class ClientIn(Struct, rename={"type": "t", "data": "d"}):
    type: str
    data: Raw | None = UNSET
