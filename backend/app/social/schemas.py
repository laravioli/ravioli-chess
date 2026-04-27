from pydantic import UUID4, AwareDatetime
from ravioli_core.db.models.social import FriendshipStatus

from app.api.schemas import BaseSchema


# out
class Friend(BaseSchema):
    id: UUID4
    username: str
    last_update: AwareDatetime


class FriendRequest(Friend):
    direction: str


class FriendShip(BaseSchema):
    is_sender: bool
    status: FriendshipStatus
