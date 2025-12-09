import functools
import msgspec
from typing import TypeVar, Union, Any

T = TypeVar("T")


class Serializer:
    def __init__(self, format, encode_as_bytes=True):
        self._as_bytes = encode_as_bytes
        self._decoder_cache: dict[
            Any, Union[msgspec.json.Decoder, msgspec.msgpack.Decoder]
        ] = {}
        match format:
            case "json":
                self._module_format = msgspec.json
            case "msgpack":
                self._module_format = msgspec.msgpack
            case _:
                raise ValueError("Invalid format")

    @functools.cached_property
    def encoder(self):
        return self._module_format.Encoder()

    @functools.cached_property
    def encode(self):
        _encoder = self.encoder
        if self._as_bytes:
            return lambda obj: _encoder.encode(obj)
        else:
            return lambda obj: _encoder.encode(obj).decode("utf-8")

    def decode(self, obj, *, type: T) -> T:
        try:
            return self._decoder_cache[type].decode(obj)
        except KeyError:
            decoder = self._module_format.Decoder(type=type)
            self._decoder_cache[type] = decoder
            return decoder.decode(obj)


json = Serializer("json", encode_as_bytes=False)
msgpack = Serializer("msgpack")


def setup_channel_redis_serializer():
    """override channel_redis default serializer"""
    from .protocol import ravioOUT
    from typing import Union
    from channels_redis.serializers import registry

    class ChannelRedisSerializer:
        """compatible class with channel_redis serializer interface"""

        def __init__(self, **kwargs):
            pass

        def serialize(self, obj):
            return msgpack.encode(obj)

        def deserialize(self, message: bytes):
            return msgpack.decode(message, type=Union[ravioOUT.Protocol])

    registry.register_serializer("msgpack", ChannelRedisSerializer)
