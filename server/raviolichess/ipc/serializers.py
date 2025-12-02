from abc import ABC, abstractmethod
import json
import msgspec
from typing import TypeVar, Generic, Union, Any, get_origin

T = TypeVar("T", bytes, str)


class BaseSerializer(ABC, Generic[T]):

    @abstractmethod
    def serialize(self, obj, **kwargs) -> T: ...

    """serialize obj to a bytes or string depending on subclass"""

    @abstractmethod
    def deserialize(self, message, **kwargs) -> Any: ...

    """deserialize a message from a string or byte string"""


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


class JsonSerializer(BaseSerializer[str]):
    """json serializer, not thread-safe"""

    def __init__(self):
        self._encoder = msgspec.json.Encoder()
        self._decoders = DefaultDecoder("json")

    def serialize(self, obj):
        return self._encoder.encode(obj).decode("utf-8")

    def deserialize(self, message: bytes | str, *, type: type):
        return self._decoders[type].decode(message)


class MsgpackSerializer(BaseSerializer[bytes]):
    """msgpack serializer, not thread-safe"""

    def __init__(self):
        self._encoder = msgspec.msgpack.Encoder()
        self._decoders = DefaultDecoder("msgpack")

    def serialize(self, obj):
        return self._encoder.encode(obj)

    def deserialize(self, message: bytes, *, type: type):
        return self._decoders[type].decode(message)


class SerializerRegistry:
    """a container that store serializer instance. not thread safe"""

    def __init__(self):
        self._registry: dict[str, BaseSerializer] = {}

    def register(self, format, serializer_instance):
        assert isinstance(serializer_instance, BaseSerializer)
        self._registry[format] = serializer_instance

    @property
    def json(self) -> JsonSerializer:
        return self._registry["json"]

    @property
    def msgpack(self) -> MsgpackSerializer:
        return self._registry["msgpack"]
