from datetime import datetime
from typing import Annotated, Literal

from pydantic import Field, TypeAdapter

from app.api.schemas import BaseSchema


class NotificationBase(BaseSchema):
    id: int
    created_at: datetime
    type: str


class FriendRequestSchema(NotificationBase):
    type: Literal["friend_request"]
    sender: str


Notification = Annotated[FriendRequestSchema, Field(discriminator="type")]

notification_adapter = TypeAdapter(list[Notification])
