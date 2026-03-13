import asyncio
import logging

from fastapi import WebSocket

from app.deps import BroadCastClient

from .base import BaseConsumer

logger = logging.getLogger(__name__)


class GameConsumer(BaseConsumer):
    def __init__(self, websocket: WebSocket, broadcast: BroadCastClient, game_id: str):
        super().__init__(websocket, broadcast)
        self.game_id = game_id

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
