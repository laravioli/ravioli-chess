from typing import Annotated, TypedDict

from fastapi import Depends
from fastapi.requests import HTTPConnection
from fastapi.websockets import WebSocket

from app.auth.deps import UserOrAnon

from .env import WsEnv
from .schemas import Sri, User


async def get_ws_env(conn: HTTPConnection):
    return conn.state["ws_env"]


type WsEnvDep = Annotated[WsEnv, Depends(get_ws_env)]


async def get_user(user: UserOrAnon):
    if user:
        return User.model_validate(user)


class WebsocketParams(TypedDict):
    sri: Sri
    user: User | None
    websocket: WebSocket
    env: WsEnv


async def get_websocket_params(
    sri: Sri,
    user: Annotated[User | None, Depends(get_user)],
    websocket: WebSocket,
    env: WsEnvDep,
):
    return WebsocketParams(
        sri=sri,
        user=user,
        websocket=websocket,
        env=env,
    )


type WebsocketParamsDep = Annotated[WebsocketParams, Depends(get_websocket_params)]
