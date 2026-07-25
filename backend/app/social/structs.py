from datetime import datetime
from uuid import UUID

from msgspec import Struct

from ravioli_core.db.models.social import FriendshipStatus


class Friendship(Struct, frozen=True):
    id: int
    sender_id: UUID
    receiver_id: UUID
    status: FriendshipStatus
    last_update: datetime
