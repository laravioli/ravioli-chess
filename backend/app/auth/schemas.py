from pydantic import UUID4, Field, SecretStr

from app.api.schemas import BaseSchema
from app.pref.schemas import PreferenceOut


class UserLogin(BaseSchema):
    username: str
    password: SecretStr


class UserSuccess(BaseSchema):
    id: UUID4
    username: str
    preference: PreferenceOut
    unread_count: int = Field(serialization_alias="unreadCount")
