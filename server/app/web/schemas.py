from app.api.schemas import BaseSchema
from app.pref.schemas import Preference


class User(BaseSchema):
    username: str = ""
    is_auth: bool = False
    preference: Preference
