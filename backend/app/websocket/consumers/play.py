import logging

from fastapi import WebSocket
from ravioli_core.ipc import ClientIn, c_out, p_in, p_out
from ravioli_core.ipc.channels import WsGameChan

from app.deps import BroadCastClient
from app.websocket.heartbeat import HeartBeat
from app.websocket.schemas import Game

from .base import Consumer

logger = logging.getLogger(__name__)


class PlayConsumer(Consumer):
    CLIENT_OUT_FRAME = c_out.GameMove
    PROCESS_OUT_FRAME = p_out.GameUpdate

    def __init__(
        self,
        sri,
        user,
        websocket: WebSocket,
        broadcast: BroadCastClient,
        heartbeat: HeartBeat,
        game: Game,
    ):
        super().__init__(sri, user, websocket, broadcast, heartbeat)
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
