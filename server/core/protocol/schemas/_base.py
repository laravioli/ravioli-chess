from typing import Literal

from msgspec import Raw, Struct


class Msg(Struct, rename={"type": "t", "data": "d"}):
    """
    **Example:**
    ```dict
    {"t":"move","d":{"san":"e4"}}
    ```
    """


class TaggedMsg(Struct, rename={"data": "d"}, tag_field="t"):
    """
    **Example:**
    ```dict
    {"t":"newgame","d":{"wp":"ravioli"}}
    ```
    """


class BroadcastEnvelope(Struct):
    """transport envelope for all outbound server messages"""

    source: Literal["app", "engine"]
    msg: Raw
