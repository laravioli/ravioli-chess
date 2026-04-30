from app.websocket.base.exceptions import UnHandledMsg
from app.websocket.base.protocol import ConsumerProtocol
from ravioli_core.ipc import ClientIn, c_out, p_in, p_out
from ravioli_core.ipc.channels import EngineGameCreateChan

type ClientMsgOut = c_out.GameCreate
type ProcessMsgOut = p_out.GameCreate


class SiteProtocol(ConsumerProtocol):
    async def client_protocol(self, msg: ClientMsgOut):
        response, channel = (None, None)
        match msg:
            case c_out.GameCreate(data):
                response, channel = (
                    p_in.GameCreate(
                        sri=self.params["sri"],
                        data=data,
                    ),
                    EngineGameCreateChan(1),
                )
            case _:
                raise UnHandledMsg(msg)

        if response and channel:
            await self.publish(channel, response)

    async def process_protocol(self, msg: ProcessMsgOut):
        match msg:
            case p_out.GameCreate(data):
                await self.send_json(ClientIn(type="gameCreate", data=data))
            case _:
                raise UnHandledMsg(msg)

    async def disconnect(self):
        pass
