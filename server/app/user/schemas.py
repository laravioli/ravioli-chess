from typing import Annotated

from app.core.schemas import BaseSchema
from app.preference.schemas import Preference
from pydantic import (
    UUID4,
    AfterValidator,
    AwareDatetime,
    EmailStr,
    Field,
    SecretStr,
    StringConstraints,
    ValidationInfo,
)


# In
def check_passwords_match(value: str, info: ValidationInfo) -> str:
    if value != info.data["password"]:
        raise ValueError("Passwords do not match")
    return value


class UserCreate(BaseSchema):
    username: Annotated[
        str,
        StringConstraints(
            min_length=3, max_length=150, pattern=r"^[\w.@+-]+$", strip_whitespace=True
        ),
    ]
    email: EmailStr
    password: Annotated[SecretStr, Field(min_length=6)]
    password_repeat: Annotated[SecretStr, AfterValidator(check_passwords_match)]


# Out
class UserBase(BaseSchema):
    username: str
    joined_at: AwareDatetime


class UserWithPref(UserBase):
    id: UUID4
    preference: Preference


class UserSearch(BaseSchema):
    id: UUID4
    username: str


# Note
# Define once at module level
# users_adapter = TypeAdapter(list[User])
# will act as a Pydantic Model
