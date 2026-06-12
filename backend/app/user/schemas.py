from typing import Annotated

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

from app.api.schemas import BaseSchema
from app.pref.schemas import Preference
from ravioli_core.db.models.social import FriendshipStatus


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
        Field(examples=["ravioli"]),
    ]
    email: Annotated[EmailStr, Field(examples=["ravioli@chess.com"])]
    password: Annotated[SecretStr, Field(min_length=6)]
    password_repeat: Annotated[SecretStr, AfterValidator(check_passwords_match)]


# Out
class UserBase(BaseSchema):
    id: UUID4
    username: str


class UserSearch(UserBase):
    online: bool


class FriendShip(BaseSchema):
    is_sender: bool
    status: FriendshipStatus


class UserProfile(UserBase):
    friendship: FriendShip | None = None
    joined_at: AwareDatetime


class UserWithPref(UserBase):
    preference: Preference
    joined_at: AwareDatetime


# Note
# Define once at module level
# users_adapter = TypeAdapter(list[User])
# will act as a Pydantic Model
