import msgspec
from . import DefaultDecoder
from typing import Any, Union, TypeVar

T = TypeVar("T")

_encoder = msgspec.json.Encoder()
_decoder = DefaultDecoder("json")


def encode(obj: Any) -> str:
    return _encoder.encode(obj).decode("utf-8")


def decode(message: Union[bytes, str], *, type: T) -> T:
    return _decoder[type].decode(message)
