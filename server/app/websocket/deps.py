from typing import Annotated

from fastapi import Depends
from fastapi.websockets import WebSocket

from app.deps import BroadCastClient

from .consumers import PlayConsumer, SiteConsumer


# trick to avoid running code in a thread-pool
async def create_site_consumer(websocket: WebSocket, broadcast: BroadCastClient):
    return SiteConsumer(websocket=websocket, broadcast=broadcast)


async def create_play_consumer(websocket: WebSocket, broadcast: BroadCastClient, game_id: str):
    return PlayConsumer(websocket=websocket, broadcast=broadcast, game_id=game_id)


type SiteDep = Annotated[SiteConsumer, Depends(create_site_consumer)]
type PlayDep = Annotated[PlayConsumer, Depends(create_play_consumer)]
