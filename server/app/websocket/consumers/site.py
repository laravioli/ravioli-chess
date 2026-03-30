import logging
from functools import cached_property

from core.ipc import app_out, client_out, engine_in, engine_out
from core.ipc.channels import EngineGameCreateChan, UserChan

from .base import BaseConsumer

logger = logging.getLogger(__name__)


class SiteConsumer(BaseConsumer):
    @cached_property
    def channels(self):
        if self.user:
            return (self.consumer_channel, UserChan(str(self.user.id)))
        return (self.consumer_channel,)

    async def handle_client_msg(self, msg):
        response, channel = (None, None)
        try:
            match msg:
                case client_out.GameCreate(data):
                    response, channel = (
                        engine_in.GameCreate(
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

    async def handle_engine_msg(self, msg):
        match msg:
            case engine_out.GameCreate():
                await self.send_json(msg)

    async def handle_app_msg(self, msg):
        match msg:
            case app_out.TestMsg():
                logger.info(msg)

    async def disconnect(self):
        pass
