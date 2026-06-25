# type: ignore
from collections.abc import Callable
from typing import Any, overload

import msgspec

type Encoder = msgspec.json.Encoder | msgspec.msgpack.Encoder
type Decoder = type[msgspec.json.Decoder | msgspec.msgpack.Decoder]
type BytesOrStr = bytes | str


def build_serializer(encoder: Encoder, decoder: Decoder):
    _encode = encoder.encode
    _decode: dict[type, Callable[[bytes | str], Any]] = {}

    def encode(obj: Any) -> bytes:
        return _encode(obj)

    def encode_as_str(obj: Any) -> str:
        return _encode(obj).decode()

    @overload
    def decode[T](data: BytesOrStr, type_arg: type[T]) -> T: ...

    @overload
    def decode(data: BytesOrStr, type_arg: Any = ...) -> Any: ...

    def decode(data: BytesOrStr, type_arg=Any):
        try:
            return _decode[type_arg](data)
        except KeyError:
            _decode[type_arg] = decoder(type=type_arg).decode
            return _decode[type_arg](data)

    return encode, encode_as_str, decode
