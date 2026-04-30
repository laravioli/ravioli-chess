from datetime import datetime
from typing import Annotated, Literal, TypeVar

from fastapi import Query
from fastapi_pagination import Page, Params, set_page
from fastapi_pagination.customization import CustomizedPage, UseAdditionalFields, UseName, UseParams
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


# pagination
T = TypeVar("T")


class NotifParams(Params):
    page: int = Query(1, ge=1, description="Page number")
    size: int = Query(4, ge=1, le=20, description="Page size")

    def is_default_page(self):
        return self.page == 1 and self.size == 4


NotifPagination = CustomizedPage[
    Page[T],
    UseParams(NotifParams),
    UseAdditionalFields(unread=int),
    UseName("Page"),
]

notification_adapter = TypeAdapter(NotifPagination[Notification])


def pagination(coro):
    # NOTE paginate class is not set without response class in endpoint
    async def wrapper(*args, **kwargs):
        with set_page(NotifPagination[Notification]):
            return await coro(*args, **kwargs)

    return wrapper
