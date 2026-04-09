import logging

from fastapi import WebSocket

from app.deps import BroadCastClient
from app.websocket.schemas import Game
from core.ipc import ClientIn, c_out, p_in, p_out
from core.ipc.channels import WsGameChan

from .base import Consumer

logger = logging.getLogger(__name__)


class PlayConsumer(Consumer):
    c_out_frame = c_out.GameMove
    p_out_frame = p_out.GameUpdate

    def __init__(self, sri, user, websocket: WebSocket, broadcast: BroadCastClient, game: Game):
        super().__init__(sri, user, websocket, broadcast)
        self.game = game
        self.channels.append(WsGameChan(self.game.id))

    async def handle_client_msg(self, msg):
        response = None
        match msg:
            case c_out.GameMove(data):
                response = p_in.GameMove(san=data.san)
            case _:
                await super().handle_client_msg(msg)

        if response:
            await self.broadcast.publish(self.game.chan, response)

    async def handle_process_msg(self, msg):
        match msg:
            case p_out.GameUpdate(type, data):
                await self.send_json(ClientIn(type, data))
            case msg:
                await super().handle_process_msg(msg)

    async def disconnect(self):
        pass
