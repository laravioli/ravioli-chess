import logging
from functools import cached_property

from fastapi import WebSocket

from app.deps import BroadCastClient
from core.ipc import ClientIn, c_out, p_in, p_out
from core.ipc.channels import EngineGameChan, UserChan, WsGameChan

from .base import BaseConsumer

logger = logging.getLogger(__name__)


class PlayConsumer(BaseConsumer):
    c_out_frame = c_out.GameMove
    p_out_frame = p_out.GameUpdate

    def __init__(self, user, websocket: WebSocket, broadcast: BroadCastClient, game_id: str):
        super().__init__(user, websocket, broadcast)
        self.game_id = game_id
        self.game_channel = EngineGameChan(game_id)

    @cached_property
    def channels(self):
        if self.user:
            return (self.consumer_channel, UserChan(str(self.user.id)), WsGameChan(self.game_id))
        return (self.consumer_channel, WsGameChan(self.game_id))

    async def handle_client_msg(self, msg):
        response = None
        try:
            match msg:
                case c_out.GameMove(data):
                    response = p_in.GameMove(san=data.san)
                case _:
                    logger.warning("received an unknow request")
        except Exception:
            raise
        else:
            if response:
                await self.broadcast.publish(self.game_channel, response)

    async def handle_process_msg(self, msg):
        match msg:
            case p_out.GameUpdate(type, data):
                await self.send_json(ClientIn(type, data))

    async def disconnect(self):
        pass
