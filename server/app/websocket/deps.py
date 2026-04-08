from typing import Annotated

from fastapi import Depends
from fastapi.websockets import WebSocket

from app.auth.deps import UserOrAnon
from app.deps import BroadCastClient

from .consumers import PlayConsumer, SiteConsumer
from .schemas import User


async def get_user(user: UserOrAnon):
    if user:
        return User.model_validate(user)


type MaybeUser = Annotated[User | None, Depends(get_user)]


# trick to avoid running code in a thread-pool
async def site_consumer(user: MaybeUser, websocket: WebSocket, broadcast: BroadCastClient):
    return SiteConsumer(user=user, websocket=websocket, broadcast=broadcast)


async def play_consumer(
    user: MaybeUser, websocket: WebSocket, broadcast: BroadCastClient, game_id: str
):
    return PlayConsumer(user=user, websocket=websocket, broadcast=broadcast, game_id=game_id)


type SiteDep = Annotated[SiteConsumer, Depends(site_consumer)]
type PlayDep = Annotated[PlayConsumer, Depends(play_consumer)]
