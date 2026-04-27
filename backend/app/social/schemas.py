from pydantic import UUID4, AwareDatetime

from app.api.schemas import BaseSchema
from ravioli_service.db.models.social import FriendshipStatus


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
