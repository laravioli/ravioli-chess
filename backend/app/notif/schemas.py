from datetime import datetime
from typing import Annotated, Any, Literal, TypeVar, cast

from fastapi import Query
from fastapi_pagination import Page, Params, set_page
from fastapi_pagination.bases import AbstractPage
from fastapi_pagination.customization import CustomizedPage, UseAdditionalFields, UseName, UseParams
from pydantic import UUID4, AliasPath, Field, TypeAdapter

from app.api.schemas import BaseSchema


class NotificationBase(BaseSchema):
    id: int
    sender_id: UUID4
    sender: str = Field(
        validation_alias=AliasPath("sender", "username"),
    )
    created_at: datetime
    type: str


class FriendRequestSchema(NotificationBase):
    notif_type: Literal["friend_request"] = Field(validation_alias="type")


class FriendRequestAcceptedSchema(NotificationBase):
    notif_type: Literal["friend_request_accepted"] = Field(validation_alias="type")


type Notification = Annotated[
    FriendRequestSchema | FriendRequestAcceptedSchema, Field(discriminator="notif_type")
]


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

notification_ta = TypeAdapter(NotifPagination[Notification])


def pagination(coro):
    # NOTE decorator to use paginator outside fastapi endpoint
    async def wrapper(*args, **kwargs):
        with set_page(cast(type[AbstractPage[Any]], NotifPagination[Notification])):
            return await coro(*args, **kwargs)

    return wrapper
