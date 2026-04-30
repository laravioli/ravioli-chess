from typing import Annotated

from fastapi import Depends

from app.websocket.base.channels import make_channels
from app.websocket.base.consumer import Consumer
from app.websocket.base.messages import MessageTypes
from app.websocket.deps import WebsocketParamsDep
from ravioli_core.ipc.channels import EngineGameChan, WsGameChan

from .protocol import ClientMsgOut, PlayProtocol, ProcessMsgOut
from .schemas import Game


async def play_consumer(params: WebsocketParamsDep, game_id: str):
    channels = make_channels(params, [WsGameChan(game_id)])
    message_types = MessageTypes.make(bool(params["user"]), ClientMsgOut, ProcessMsgOut)
    protocol = PlayProtocol(params, Game(game_id, EngineGameChan(game_id)))
    return Consumer(
        **params,
        channels=channels,
        message_types=message_types,
        protocol=protocol,
    )


type PlayConsumerDep = Annotated[Consumer, Depends(play_consumer)]
