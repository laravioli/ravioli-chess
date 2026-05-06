from typing import Annotated, TypedDict

from fastapi import Depends
from fastapi.websockets import WebSocket

from app.auth.deps import UserOrAnon
from app.deps import BroadCastClient

from .schemas import Sri, User


async def get_user(user: UserOrAnon):
    if user:
        return User.model_validate(user)


class WebsocketParams(TypedDict):
    sri: Sri
    user: User | None
    websocket: WebSocket
    broadcast: BroadCastClient


async def get_websocket_params(
    sri: Sri,
    user: Annotated[User | None, Depends(get_user)],
    websocket: WebSocket,
    broadcast: BroadCastClient,
):
    return WebsocketParams(
        sri=sri,
        user=user,
        websocket=websocket,
        broadcast=broadcast,
    )


type WebsocketParamsDep = Annotated[WebsocketParams, Depends(get_websocket_params)]
