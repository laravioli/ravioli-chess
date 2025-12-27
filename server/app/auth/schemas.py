import uuid

import msgspec
from pydantic import SecretStr

from app.api.schemas import BaseSchema
from app.preference.schemas import Preference


class UserLogin(BaseSchema):
    username: str
    password: SecretStr


class UserSuccess(BaseSchema):
    username: str
    preference: Preference


class UserLogout(BaseSchema):
    message: str


class Session(msgspec.Struct):
    user_id: uuid.UUID
    auth_hash: bytes
