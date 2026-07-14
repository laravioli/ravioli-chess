from collections.abc import Mapping

from msgspec import Struct, convert
from msgspec.structs import asdict


class CoreStruct(Struct, frozen=True):
    @classmethod
    def from_mapping(cls, mapping: Mapping):
        return convert(mapping, cls)

    def to_dict(self) -> dict:
        return asdict(self)
