import logging

from core.ipc.channels import GameCreateChan
from core.ipc.schemas import ClientOut, EngineIn, EngineOut

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
                case ClientOut.GameCreate(data):
                    response, channel = (
                        EngineIn.GameCreate(
                            channel=self.channel_name,
                            white_player=data.white_player,
                            black_player=data.black_player,
                        ),
                        GameCreateChan(1),
                    )
                case _:
                    logger.warning("received an unknow request")
        except Exception:
            pass
        else:
            if response and channel:
                await self.broadcast.publish(channel, response)

    async def game_create(self, event: EngineOut.GameCreate):
        await self.send_json(event.data)

    async def disconnect(self):
        logger.info("disconnected")
