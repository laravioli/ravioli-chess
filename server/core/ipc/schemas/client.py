import msgspec


class Frame(msgspec.Struct, tag_field="t"):
    """
    client frame structure.

    **Example:**
    ```json
    {"t":"newgame","d":{"wp":"ravioli"}}
    ```
    """

    ...


# ╔══════════════════════════════════════╗
# ║   CLIENT IN : ws -> client           ║
# ╚══════════════════════════════════════╝


class ClientIn:
    class GameCreate(Frame, tag="gamecreated"):
        class Payload(msgspec.Struct):
            game_id: str

        data: Payload = msgspec.field(name="d")

    type Protocol = GameCreate


# ╔══════════════════════════════════════╗
# ║   CLIENT OUT : ws <- client          ║
# ╚══════════════════════════════════════╝


class ClientOut:
    class GameCreate(Frame, tag="newgame"):
        class Payload(msgspec.Struct):
            white_player: str | None = msgspec.field(name="wp", default=None)
            black_player: str | None = msgspec.field(name="bp", default=None)

        data: Payload | None = msgspec.field(name="d", default_factory=Payload)

    class GameMove(Frame, tag="move"):
        class Move(msgspec.Struct):
            san: str

        data: Move = msgspec.field(name="d")

    type Protocol = GameCreate | GameMove
