import logging

from core.ipc import ClientIn, c_out, p_in, p_out
from core.ipc.channels import EngineGameCreateChan

from .base import Consumer

logger = logging.getLogger(__name__)


class SiteConsumer(Consumer):
    c_out_frame = c_out.GameCreate
    p_out_frame = p_out.GameCreate

    async def handle_client_msg(self, msg):
        response, channel = (None, None)
        match msg:
            case c_out.GameCreate(data):
                response, channel = (
                    p_in.GameCreate(
                        sri=self.sri,
                        data=data,
                    ),
                    EngineGameCreateChan(1),
                )
            case _:
                await super().handle_client_msg(msg)

        if response and channel:
            await self.broadcast.publish(channel, response)

    async def handle_process_msg(self, msg):
        match msg:
            case p_out.GameCreate(data):
                await self.send_json(ClientIn(type="gameCreate", data=data))
            case msg:
                await super().handle_process_msg(msg)

    async def disconnect(self):
        pass
