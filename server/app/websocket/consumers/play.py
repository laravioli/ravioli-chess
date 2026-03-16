import logging

from fastapi import WebSocket

from app.deps import BroadCastClient
from core.protocol.channels import engine_chan, websocket_chan
from core.protocol.schemas import client_out, engine_in, engine_out

from .base import BaseConsumer

logger = logging.getLogger(__name__)


class PlayConsumer(BaseConsumer):
    def __init__(self, websocket: WebSocket, broadcast: BroadCastClient, game_id: str):
        super().__init__(websocket, broadcast)
        self.game_id = game_id
        self.game_channel = engine_chan.Game(game_id)

    @property
    def channels(self):
        return (self.channel_name, websocket_chan.Game(self.game_id))

    async def handle_client_msg(self, msg):
        response = None
        try:
            match msg:
                case client_out.GameMove(data):
                    response = engine_in.GameMove(data=data)
                case _:
                    logger.warning("received an unknow request")
        except Exception:
            raise
        else:
            if response:
                await self.broadcast.publish(self.game_channel, response)

    async def handle_engine_msg(self, msg):
        match msg:
            case engine_out.GameMove():
                await self.send_json(msg)

    async def disconnect(self):
        logger.info("disconnected")
