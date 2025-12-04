import msgspec
from . import DefaultDecoder
from ..protocol import ChannelFrameProtocol
from typing import Any, TypeVar

T = TypeVar("T")

_encoder = msgspec.msgpack.Encoder()
_decoder = DefaultDecoder("msgpack")


def encode(obj: Any) -> bytes:
    return _encoder.encode(obj)


def decode(message: bytes, *, type: T) -> T:
    return _decoder[type].decode(message)


def setup_channel_redis_serializer():
    """override channel_redis default serializer"""
    from channels_redis.serializers import registry

    class ChannelRedisSerializer:
        """compatible class with channel_redis serializer interface"""

        def __init__(self, **kwargs):
            pass

        def serialize(self, obj):
            return _encoder.encode(obj)

        def deserialize(self, message: bytes) -> ChannelFrameProtocol:
            return _decoder[ChannelFrameProtocol].decode(message)

    registry.register_serializer("msgpack", ChannelRedisSerializer)
