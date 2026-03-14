import logging

from fastapi import WebSocket

from app.deps import BroadCastClient
from core.ipc.channels import EngineChan, WsChan
from core.ipc.schemas import ClientOut, EngineIn, EngineOut

from .base import BaseConsumer

logger = logging.getLogger(__name__)


class PlayConsumer(BaseConsumer):
    def __init__(self, websocket: WebSocket, broadcast: BroadCastClient, game_id: str):
        super().__init__(websocket, broadcast)
        self.game_id = game_id
        self.game_channel = EngineChan.Game(game_id)

    @property
    def channels(self):
        return (self.channel_name, WsChan.Game(self.game_id))

    async def handle_client_msg(self, msg):
        response = None
        try:
            match msg:
                case ClientOut.GameMove(data):
                    response = EngineIn.GameMove(san=data.san)
                case _:
                    logger.warning("received an unknow request")
        except Exception:
            logger.exception("error in play consumer message handling")
        else:
            if response:
                await self.broadcast.publish(self.game_channel, response)

    async def game_move(self, event: EngineOut.GameMove):
        await self.send_json(event.data)

    async def disconnect(self):
        logger.info("disconnected")
