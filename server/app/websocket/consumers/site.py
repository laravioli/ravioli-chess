import logging

from core.protocol.channels import engine_chan
from core.protocol.schemas import client_out, engine_in, engine_out
from core.protocol.schemas.payload import GameInfo

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
                            payload=GameInfo(
                                white_player=data.white_player, black_player=data.black_player
                            ),
                        ),
                        engine_chan.GameCreate(1),
                    )
                case _:
                    logger.warning("received an unknow request")
        except Exception:
            raise
        else:
            if response and channel:
                await self.broadcast.publish(channel, response)

    async def game_create(self, event: engine_out.GameCreate):
        await self.send_json(event.data)

    async def disconnect(self):
        logger.info("disconnected")
