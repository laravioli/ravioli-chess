from app.websocket.deps import WebsocketParams
from app.websocket.schemas import Sri, User
from ravioli_core.ipc.channels import WsConsumerChan, WsPlayChan, WsUserChan

from .base import Context
from .heartbeat import HeartBeat
from .play import Game, PlayConsumer, PlayContext
from .site import SiteConsumer


def base_channels(sri: Sri, user: User | None):
    channels = [WsConsumerChan(sri)]
    if user:
        channels.append(WsUserChan(user.id))
    return channels


def site_endpoint(params: WebsocketParams):
    sri, user, websocket = params["sri"], params["user"], params["websocket"]

    return SiteConsumer(
        context=Context(
            sri=sri,
            user=user,
            channels=base_channels(sri, user),
        ),
        websocket=websocket,
        broadcast=params["broadcast"],
        heartbeat=HeartBeat(websocket),
    )


def play_endpoint(params: WebsocketParams, game_id: str):
    sri, user, websocket = params["sri"], params["user"], params["websocket"]

    return PlayConsumer(
        context=PlayContext(
            sri=sri,
            user=user,
            channels=base_channels(sri, user) + [WsPlayChan(game_id)],
            game=Game(game_id),
        ),
        websocket=websocket,
        broadcast=params["broadcast"],
        heartbeat=HeartBeat(websocket),
    )
