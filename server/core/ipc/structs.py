from typing import Literal

from msgspec import Raw, Struct, field

# ╔══════════════════════════════════════╗
# ║        Envelope                      ║
# ╚══════════════════════════════════════╝


class TaggedMsg(Struct, rename={"data": "d"}, tag_field="t"):
    """
    **Example:**
    ```dict
    {"t":"game.new","d":{"wp":"ravioli"}}
    ```
    """


class ServerMsg(Struct):
    """transport envelope for all outbound server messages"""

    source: Literal["app", "engine"]
    msg: Raw


# ╔══════════════════════════════════════╗
# ║        Data                          ║
# ╚══════════════════════════════════════╝


class GameRouting(Struct):
    game_id: str


class GameInfo(Struct):
    white_player: str | None = field(name="wp", default=None)
    black_player: str | None = field(name="bp", default=None)


class MoveData(Struct):
    san: str


class ValidatedMove(Struct):
    ok: bool
    san: str


class GameStop(Struct):
    reason: str
