from msgspec import Struct, field

# ╔══════════════════════════════════════╗
# ║    CLIENT -> WEBSOCKET               ║
# ╚══════════════════════════════════════╝

# ╔══════════════════════════════════════╗
# ║    DATA                              ║
# ╚══════════════════════════════════════╝


class D_GameInfo(Struct):
    white_player: str | None = field(name="wp", default=None)
    black_player: str | None = field(name="bp", default=None)


class D_GameMove(Struct):
    san: str


# ╔══════════════════════════════════════╗
# ║    FRAME                             ║
# ╚══════════════════════════════════════╝


class ClientOUT(Struct, tag_field="t", rename={"data": "d"}): ...


# ╔══════════════════════════════════════╗
# ║    SITE                              ║
# ╚══════════════════════════════════════╝


class GameCreate(ClientOUT, tag="newGame"):
    data: D_GameInfo = field(default_factory=D_GameInfo)


class Notified(ClientOUT, tag="notified"):
    pass


# ╔══════════════════════════════════════╗
# ║    PLAY                              ║
# ╚══════════════════════════════════════╝


class GameMove(ClientOUT, tag="move"):
    data: D_GameMove
