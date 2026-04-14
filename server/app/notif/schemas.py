from datetime import datetime
from typing import Annotated, Literal

from fastapi_pagination import Page
from pydantic import UUID4, AliasChoices, AliasPath, Field, TypeAdapter

from app.api.schemas import BaseSchema


class NotificationBase(BaseSchema):
    id: int
    created_at: datetime
    type: str


class FriendRequestSchema(NotificationBase):
    type: Literal["friend_request"]
    sender: str = Field(
        # validation alias: weither it come from cache or DB
        validation_alias=AliasChoices(
            "sender",
            AliasPath("friendship", "sender", "username"),
        )
    )
    sender_id: UUID4 = Field(
        validation_alias=AliasChoices(
            "sender_id",
            AliasPath("friendship", "sender", "id"),
        )
    )


type Notification = Annotated[FriendRequestSchema, Field(discriminator="type")]

notification_adapter = TypeAdapter(Page[Notification])
