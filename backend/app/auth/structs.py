import uuid
from typing import Protocol

import msgspec

from ravioli_core.serializers import msgpack


class VerifiableUser(Protocol):
    @property
    def hashed_password(self) -> bytes: ...

    @property
    def is_active(self) -> bool: ...


class Session(msgspec.Struct):
    user_id: uuid.UUID
    auth_hash: bytes

    @classmethod
    def decode(cls, data):
        return msgpack.decode(data, type_arg=cls)
