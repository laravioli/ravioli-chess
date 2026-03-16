import msgspec

from . import build_serializer

encode, _, decode = build_serializer(msgspec.msgpack.Encoder(), msgspec.msgpack.Decoder)

__all__ = ["encode", "decode"]
