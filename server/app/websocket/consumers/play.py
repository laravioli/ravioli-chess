import logging
from functools import cached_property

from fastapi import WebSocket

from app.deps import BroadCastClient
from core.ipc import client_out, engine_in, engine_out
from core.ipc.channels import EngineGameChan, WsGameChan

from .base import BaseConsumer

logger = logging.getLogger(__name__)


class PlayConsumer(BaseConsumer):
    def __init__(self, websocket: WebSocket, broadcast: BroadCastClient, game_id: str):
        super().__init__(websocket, broadcast)
        self.game_id = game_id
        self.game_channel = EngineGameChan(game_id)

    @cached_property
    def channels(self):
        if self.user_channel:
            return (self.consumer_channel, self.user_channel, WsGameChan(self.game_id))
        return (self.consumer_channel, WsGameChan(self.game_id))

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
        pass
