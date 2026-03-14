import asyncio
import logging

from .base import BaseConsumer

logger = logging.getLogger(__name__)


class SiteConsumer(BaseConsumer):
    @property
    def channels(self):
        return [self.channel_name]

    async def handle_client(self):
        await self.websocket.send_json({"message": "pong"})
        while True:
            data = await self.receive_json()
            logger.info(data)
            await self.send_json({"message": "pong"})

    async def handle_broadcast(self):
        await asyncio.sleep(100)

    async def disconnect(self):
        logger.info("disconnected")
