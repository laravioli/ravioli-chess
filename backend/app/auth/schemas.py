import uuid

import msgspec
from pydantic import UUID4, Field, SecretStr

from app.api.schemas import BaseSchema
from app.pref import Preference


class UserLogin(BaseSchema):
    username: str
    password: SecretStr


class Session(msgspec.Struct):
    user_id: uuid.UUID
    auth_hash: bytes


class UserSuccess(BaseSchema):
    id: UUID4
    username: str
    preference: Preference
    unread_count: int = Field(serialization_alias="unreadCount")
