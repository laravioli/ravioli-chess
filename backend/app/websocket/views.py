from fastapi import APIRouter

from app.env import Env
from app.websocket.deps import WebsocketParamsDep

from .consumer.endpoint import play_endpoint, site_endpoint


def create_ws_router(env: Env):
    router = APIRouter()

    @router.websocket("/socket/site")
    async def index(deps: WebsocketParamsDep):
        consumer = site_endpoint(env, deps)
        await consumer()  # pyright: ignore[reportGeneralTypeIssues]

    @router.websocket("/socket/play/{game_id}")
    async def play(deps: WebsocketParamsDep, game_id: str):
        consumer = play_endpoint(env, deps, game_id)
        await consumer()

    return router
