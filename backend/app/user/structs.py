from datetime import datetime
from uuid import UUID

from msgspec import Struct

from app.pref.structs import Preference


class User(Struct, frozen=True):
    id: UUID
    username: str
    email: str
    is_staff: bool
    is_active: bool
    joined_at: datetime
    hashed_password: bytes

    def __eq__(self, value: object) -> bool:
        return isinstance(value, User) and value.id == self.id


class UserFull(User, frozen=True):
    preference: Preference
