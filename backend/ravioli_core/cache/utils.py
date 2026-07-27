from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from random import randint
from typing import Concatenate, NamedTuple

from pydantic import BaseModel, TypeAdapter

from ravioli_core.serializers import json


class CacheSerializer[T](NamedTuple):
    encoder: Callable[[T], bytes | str] = json.encode
    decoder: Callable[[bytes | str], T] = json.decode

    @classmethod
    def make(cls, value_type: type[T] | TypeAdapter[T]):
        match value_type:
            case type():
                if issubclass(value_type, BaseModel):
                    return cls(
                        lambda v: value_type.model_validate(v).model_dump_json(),
                        lambda v: value_type.model_validate_json(v),
                    )
                else:
                    return cls(decoder=lambda v: json.decode(v, type_arg=value_type))
            case TypeAdapter():
                return cls(
                    lambda v: value_type.dump_json(value_type.validate_python(v)),
                    lambda v: value_type.validate_json(v),
                )


@dataclass(slots=True, frozen=True, kw_only=True)
class KeyBuilder:
    prefix: str = "cache"
    version: str = "v1"
    name: str

    def __call__(self, key):
        return f"{self.prefix}:{self.version}:{self.name}:{key}"


type ValueBuilder[T, **P] = Callable[Concatenate[str, P], Awaitable[T | None]]


@dataclass(slots=True, frozen=True)
class Jitter:
    ttl: int = 300
    ratio: float = 0.1

    def compute(self):
        return self.ttl + randint(0, int(self.ttl * self.ratio))
