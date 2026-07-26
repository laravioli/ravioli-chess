from uuid import UUID

from msgspec import Struct

from app.pref.structs import Preference
from app.user import User


class UserData(Struct, frozen=True, omit_defaults=True):
    username: str
    is_auth: bool
    id: UUID | None = None
    unread_count: int | None = None


ANON_DATA = UserData(username="", is_auth=False)


class UserCtx(Struct, frozen=True):
    user: User | None
    preference: Preference
    unread_count: int | None = None

    @property
    def data(self):
        if self.user:
            me = self.user
            return UserData(
                id=me.id, username=me.username, is_auth=True, unread_count=self.unread_count
            )
        else:
            return ANON_DATA

    @property
    def preference_attrs(self):
        return self.preference.to_html_attrs

    @property
    def piece_style(self):
        return self.preference.pieceset.value
