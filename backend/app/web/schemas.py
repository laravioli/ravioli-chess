from functools import cached_property
from typing import Literal

from pydantic import UUID4

from app.api.schemas import BaseSchema
from app.pref.schemas import Preference


class User(BaseSchema):
    """User schema used in html templates and other web services\n
    Anon users are represented with not User.is_auth
    """

    id: UUID4 | Literal[""] = ""
    username: str = ""
    is_auth: bool = False
    preference: Preference

    @classmethod
    def anon(cls, pref_data: dict):
        return cls(preference=Preference(**pref_data))

    @cached_property
    def pref_attr(self):
        data = self.preference.model_dump(mode="json", exclude_none=True)
        return " ".join([f'data-{k}="{v}"' for k, v in data.items()])

    @cached_property
    def piece_style(self):
        return self.preference.pieceset

    @cached_property
    def info(self):
        return {"id": str(self.id), "username": self.username, "is_auth": self.is_auth}
