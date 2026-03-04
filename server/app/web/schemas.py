from app.api.schemas import BaseSchema
from app.pref.schemas import Preference


class User(BaseSchema):
    username: str = ""
    is_auth: bool = False
    preference: Preference

    @property
    def html_pref(self):
        data = self.preference.model_dump(mode="json", exclude_none=True)
        return " ".join([f'data-{k}="{v}"' for k, v in data.items()])
