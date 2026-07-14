from dataclasses import dataclass
from uuid import UUID

from msgspec import Struct

from app.pref import Preference
from app.user import User


class AuthPayload(Struct):
    id: UUID
    username: str
    is_auth: bool
    unread_count: int | None


ANON_PAYLOAD = {"id": "", "username": "", "is_auth": False}


@dataclass(slots=True, frozen=True)
class UserCtx:
    user: User | None
    preference: Preference
    unread_count: int | None = None

    @property
    def payload(self):
        if self.user:
            me = self.user
            return AuthPayload(
                id=me.id, username=me.username, is_auth=True, unread_count=self.unread_count
            )
        else:
            return ANON_PAYLOAD

    @property
    def preference_attrs(self):
        return self.preference.html_attrs

    @property
    def piece_style(self):
        return self.preference.pieceset.value
