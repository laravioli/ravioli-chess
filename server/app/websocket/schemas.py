from typing import Annotated

from pydantic import StringConstraints

from app.user.schemas import UserBase

SRI_PATTERN = r"^[a-zA-Z0-9_]+$"


class User(UserBase):
    is_active: bool
    is_staff: bool


type MaybeUser = User | None

type Sri = Annotated[str, StringConstraints(min_length=8, max_length=12, pattern=SRI_PATTERN)]
