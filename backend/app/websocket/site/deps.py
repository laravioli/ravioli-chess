from typing import Annotated

from fastapi import Depends

from app.websocket.base.channels import make_channels
from app.websocket.base.consumer import Consumer
from app.websocket.base.messages import MessageTypes
from app.websocket.deps import WebsocketParamsDep

from .protocol import ClientMsgOut, ProcessMsgOut, SiteProtocol


async def site_consumer(params: WebsocketParamsDep):
    channels = make_channels(params)
    message_types = MessageTypes.make(bool(params["user"]), ClientMsgOut, ProcessMsgOut)
    protocol = SiteProtocol(params)
    return Consumer(
        **params,
        channels=channels,
        message_types=message_types,
        protocol=protocol,
    )


type SiteConsumerDep = Annotated[Consumer, Depends(site_consumer)]
