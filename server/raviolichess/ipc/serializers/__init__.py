import msgspec
from typing import get_origin, Union


class DefaultDecoder(dict[type, msgspec.json.Decoder]):

    def __init__(self, format):
        if format == "json":
            self.factory = msgspec.json.Decoder
        elif format == "msgpack":
            self.factory = msgspec.msgpack.Decoder
        else:
            raise ValueError("unsupported serializer format")

    def __missing__(self, key):
        if isinstance(key, type) or get_origin(key) is Union:
            decoder = self.factory(type=key)
            self[key] = decoder
            return decoder
        raise ValueError("key must be a type or a Union")
