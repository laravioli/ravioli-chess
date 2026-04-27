from typing import Annotated

from fastapi import Depends
from fastapi.websockets import WebSocket
from ravioli_core.ipc.channels import EngineGameChan

from app.auth.deps import UserOrAnon
from app.deps import BroadCastClient

from .consumers import PlayConsumer, SiteConsumer
from .heartbeat import HeartBeat
from .schemas import Game, Sri, User


async def get_user(user: UserOrAnon):
    if user:
        return User.model_validate(user)


async def get_websocket_params(
    sri: Sri,
    user: Annotated[User | None, Depends(get_user)],
    websocket: WebSocket,
    broadcast: BroadCastClient,
):
    return {
        "sri": sri,
        "user": user,
        "websocket": websocket,
        "broadcast": broadcast,
        "heartbeat": HeartBeat(websocket=websocket),
    }


type BaseWebsocketParams = Annotated[dict, Depends(get_websocket_params)]


async def site_consumer(params: BaseWebsocketParams):
    return SiteConsumer(**params)


async def play_consumer(params: BaseWebsocketParams, game_id: str):
    return PlayConsumer(**params, game=Game(id=game_id, chan=EngineGameChan(game_id)))


type SiteDep = Annotated[SiteConsumer, Depends(site_consumer)]
type PlayDep = Annotated[PlayConsumer, Depends(play_consumer)]
