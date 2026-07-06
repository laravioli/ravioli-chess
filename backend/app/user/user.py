from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID

from sqlalchemy import RowMapping

from app.pref import Preference


@dataclass(slots=True, frozen=True)
class User:
    id: UUID
    username: str
    email: str
    hashed_password: bytes = field(repr=False)
    is_staff: bool
    is_active: bool
    joined_at: datetime

    def __eq__(self, value: object) -> bool:
        return isinstance(value, User) and value.id == self.id

    @classmethod
    def from_row(cls, row: RowMapping, **kwargs):

        return cls(
            id=row["id"],
            username=row["username"],
            email=row["email"],
            hashed_password=row["hashed_password"],
            is_staff=row["is_staff"],
            is_active=row["is_active"],
            joined_at=row["joined_at"],
            **kwargs,
        )


@dataclass(slots=True, frozen=True)
class UserWithPref(User):
    preference: Preference

    @classmethod
    def from_row(cls, row: RowMapping, **kwargs):
        preference = Preference.from_row(row)
        return super(UserWithPref, cls).from_row(row, preference=preference)


# from functools import cached_property
# from typing import Literal

# from pydantic import UUID4

# from app.api.schemas import BaseSchema
# from app.pref.schemas import Preference


# class User(BaseSchema):
#     """User schema used in html templates and other web services\n
#     Anon users are represented with not User.is_auth
#     """

#     id: UUID4 | Literal[""] = ""
#     username: str = ""
#     is_auth: bool = False
#     preference: Preference

#     @classmethod
#     def anon(cls, pref_data: dict):
#         return cls(preference=Preference(**pref_data))

#     @cached_property
#     def pref_attr(self):
#         data = self.preference.model_dump(mode="json", exclude_none=True)
#         return " ".join([f'data-{k}="{v}"' for k, v in data.items()])

#     @cached_property
#     def piece_style(self):
#         return self.preference.pieceset.value

#     @cached_property
#     def info(self):
#         return {"id": str(self.id), "username": self.username, "is_auth": self.is_auth}
