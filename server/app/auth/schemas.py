from pydantic import SecretStr

from app.api.schemas import BaseSchema
from app.preference.schemas import Preference


class UserLogin(BaseSchema):
    username: str
    password: SecretStr


class UserSuccess(BaseSchema):
    username: str
    preference: Preference
