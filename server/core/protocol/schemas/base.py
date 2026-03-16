from typing import Literal

from msgspec import Raw, Struct


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
