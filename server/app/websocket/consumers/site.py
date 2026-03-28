import logging

from core.ipc import client_out, engine_in, engine_out
from core.ipc.channels import EngineGameCreateChan

from .base import BaseConsumer

logger = logging.getLogger(__name__)


class SiteConsumer(BaseConsumer):
    @property
    def channels(self):
        return (self.channel_name,)

    async def handle_client_msg(self, msg):
        response, channel = (None, None)
        try:
            match msg:
                case client_out.GameCreate(data):
                    response, channel = (
                        engine_in.GameCreate(
                            channel=str(self.channel_name),
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

    async def disconnect(self):
        pass
