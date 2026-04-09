import logging
from functools import cached_property

from core.ipc import ClientIn, c_out, p_in, p_out
from core.ipc.channels import EngineGameCreateChan, UserChan

from .base import BaseConsumer

logger = logging.getLogger(__name__)


class SiteConsumer(BaseConsumer):
    c_out_frame = c_out.GameCreate
    p_out_frame = p_out.GameCreate | p_out.TellSocket | p_out.TellUser

    @cached_property
    def channels(self):
        if self.user:
            return (self.consumer_channel, UserChan(str(self.user.id)))
        return (self.consumer_channel,)

    async def handle_client_msg(self, msg):
        response, channel = (None, None)
        try:
            match msg:
                case c_out.GameCreate(data):
                    response, channel = (
                        p_in.GameCreate(
                            channel=str(self.consumer_channel),
                            data=data,
                        ),
                        EngineGameCreateChan(1),
                    )
                case _:
                    logger.warning("received an unknow request")
        except Exception:
            raise
        else:
            if response and channel:
                await self.broadcast.publish(channel, response)

    async def handle_process_msg(self, msg):
        match msg:
            case p_out.GameCreate(data):
                await self.send_json(ClientIn(type="gameCreate", data=data))
            case _:
                await self.handle_app_msg(msg)

    async def handle_app_msg(self, msg):
        match msg:
            case p_out.TellUser(type, data):
                await self.send_json(ClientIn(type=type, data=data))
            case _:
                logger.warning("received an unknow process msg")

    async def disconnect(self):
        pass
