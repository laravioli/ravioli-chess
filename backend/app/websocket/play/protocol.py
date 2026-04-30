from app.websocket.base.exceptions import UnHandledMsg
from app.websocket.base.protocol import ConsumerProtocol
from app.websocket.deps import WebsocketParams
from ravioli_core.ipc import ClientIn, c_out, p_in, p_out

from .schemas import Game

type ClientMsgOut = c_out.GameMove
type ProcessMsgOut = p_out.GameUpdate


class PlayProtocol(ConsumerProtocol):
    def __init__(self, params: WebsocketParams, game: Game):
        super().__init__(params)
        self.game = game

    async def client_protocol(self, msg: ClientMsgOut):
        response = None
        match msg:
            case c_out.GameMove(data):
                response = p_in.GameMove(san=data.san)
            case _:
                raise UnHandledMsg(msg)

        if response:
            await self.publish(self.game.chan, response)

    async def process_protocol(self, msg: ProcessMsgOut):
        match msg:
            case p_out.GameUpdate(type, data):
                await self.send_json(ClientIn(type, data))
            case _:
                raise UnHandledMsg(msg)

    async def disconnect(self):
        pass
