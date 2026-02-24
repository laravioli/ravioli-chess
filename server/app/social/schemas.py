from pydantic import UUID4, AwareDatetime

from app.api.schemas import BaseSchema


# In
class FriendRequest(BaseSchema):
    to: str


# out
class Friend(BaseSchema):
    id: UUID4
    username: str
    last_update: AwareDatetime
