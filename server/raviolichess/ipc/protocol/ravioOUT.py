from __future__ import annotations
import msgspec
from typing import Union

# ╔══════════════════════════════════════╗
# ║   PROTOCOL OUT : ravio -> ws         ║
# ╚══════════════════════════════════════╝


class ChannelFrame(msgspec.Struct, tag_field="type"):
    def __contains__(self, key):
        if key == "type":
            return True
        return key in self.__struct_fields__

    def __getitem__(self, key):
        if key == "type":
            return self.__struct_config__.tag
        try:
            return getattr(self, key)
        except AttributeError:
            raise KeyError(key)


class GameCreate(ChannelFrame, tag="game.create"):
    class Payload(msgspec.Struct):
        game_id: str

    data: Payload


class GameMove(ChannelFrame, tag="game.move"):
    class Payload(msgspec.Struct):
        ok: bool
        san: str

    data: Payload


class GameEnd(ChannelFrame, tag="game.end"):
    class Payload(msgspec.Struct):
        reason: str

    data: Payload


Protocol = Union[GameCreate, GameMove, GameEnd]
