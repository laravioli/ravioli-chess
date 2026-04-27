import uuid

import msgspec
from pydantic import UUID4, SecretStr

from app.api.schemas import BaseSchema
from app.pref.schemas import Preference


class UserLogin(BaseSchema):
    username: str
    password: SecretStr


class UserSuccess(BaseSchema):
    id: UUID4
    username: str
    preference: Preference


class Session(msgspec.Struct):
    user_id: uuid.UUID
    auth_hash: bytes
