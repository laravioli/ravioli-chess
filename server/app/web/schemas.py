from functools import cached_property

from app.api.schemas import BaseSchema
from app.pref.schemas import Preference


class User(BaseSchema):
    """User schema used in html templates"""

    username: str = ""
    is_auth: bool = False
    preference: Preference

    @cached_property
    def pref_attr(self):
        data = self.preference.model_dump(mode="json", exclude_none=True)
        return " ".join([f'data-{k}="{v}"' for k, v in data.items()])

    @cached_property
    def piece_style(self):
        return self.preference.pieceset.value
