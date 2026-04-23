from collections.abc import Callable
from typing import Any

import msgspec

type Encoder = msgspec.json.Encoder | msgspec.msgpack.Encoder
type Decoder = type[msgspec.json.Decoder | msgspec.msgpack.Decoder]


def build_serializer(encoder: Encoder, decoder: Decoder):
    _encode = encoder.encode
    _decode: dict[type, Callable[[bytes | str], Any]] = {}

    def encode(obj: Any) -> bytes:
        return _encode(obj)

    def encode_as_str(obj: Any) -> str:
        return _encode(obj).decode()

    def decode[T](data: bytes | str, type_arg: type[T] | Any = Any) -> T | Any:
        try:
            return _decode[type_arg](data)
        except KeyError:
            _decode[type_arg] = decoder(type=type_arg).decode
            return _decode[type_arg](data)

    return encode, encode_as_str, decode
