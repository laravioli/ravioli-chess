from app.websocket.deps import WebsocketParams
from ravioli_core.ipc.channels import WsChan

from .base import Context
from .heartbeat import HeartBeat
from .play import Game, PlayConsumer, PlayContext
from .site import SiteConsumer


def site_endpoint(params: WebsocketParams):
    sri, user, websocket = params["sri"], params["user"], params["websocket"]

    return SiteConsumer(
        context=Context(
            sri=sri,
            user=user,
            channels=[WsChan.sri(sri)],
        ),
        env=params["env"],
        websocket=websocket,
        heartbeat=HeartBeat(websocket),
    )


def play_endpoint(params: WebsocketParams, game_id: str):
    sri, user, websocket = params["sri"], params["user"], params["websocket"]

    return PlayConsumer(
        context=PlayContext(
            sri=sri,
            user=user,
            channels=[WsChan.sri(sri), WsChan.play(game_id)],
            game=Game(game_id),
        ),
        env=params["env"],
        websocket=websocket,
        heartbeat=HeartBeat(websocket),
    )
