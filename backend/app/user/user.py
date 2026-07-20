from collections.abc import Mapping
from datetime import datetime
from uuid import UUID

from app.pref.schemas import Preference
from ravioli_core.structs import CoreStruct


class User(CoreStruct, frozen=True):
    id: UUID
    username: str
    email: str
    is_staff: bool
    is_active: bool
    joined_at: datetime
    hashed_password: bytes

    def __eq__(self, value: object) -> bool:
        return isinstance(value, User) and value.id == self.id


class UserWithPref(CoreStruct, frozen=True):
    user: User
    preference: Preference

    @classmethod
    def from_mapping(cls, mapping: Mapping):
        return UserWithPref(user=User.from_mapping(mapping), preference=Preference(**mapping))


class UserWithPref2(User, frozen=True):
    preference: Preference
