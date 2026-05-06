from fastapi import APIRouter

from app.websocket.deps import WebsocketParamsDep

from .consumer.endpoint import play_endpoint, site_endpoint

router = APIRouter()


@router.websocket("/socket/site")
async def index(deps: WebsocketParamsDep):
    consumer = site_endpoint(deps)
    await consumer()


@router.websocket("/socket/play/{game_id}")
async def play(deps: WebsocketParamsDep, game_id: str):
    consumer = play_endpoint(deps, game_id)
    await consumer()
