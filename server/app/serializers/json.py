import msgspec

from . import build_serializer

encode, encode_as_str, decode = build_serializer(msgspec.json.Encoder(), msgspec.json.Decoder)
