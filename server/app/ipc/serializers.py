from typing import Any, Protocol, TypeVar

import msgspec

T = TypeVar("T")


class Serializer[U](Protocol):
    def encode(self, obj: Any) -> bytes: ...
    def encode_as_str(self, obj: Any) -> str: ...
    def decode(self, obj: U, t: T) -> T: ...


json_encoder = msgspec.json.Encoder()
json_decoder: dict[type, msgspec.json.Decoder] = {}


class MsgspecJSON(Serializer[str]):
    def encode(self, obj):
        return json_encoder.encode(obj)

    def encode_as_str(self, obj):
        return json_encoder.encode(obj).decode()

    def decode(self, obj, t):
        try:
            return json_decoder[t].decode(obj)
        except KeyError:
            json_decoder[t] = msgspec.json.Decoder(type=t)
        return json_decoder[t].decode(obj)
