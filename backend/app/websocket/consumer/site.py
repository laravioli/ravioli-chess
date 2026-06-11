from ravioli_core.ipc import c_out, p_in
from ravioli_core.ipc.channels import EngChan
from ravioli_core.serializers import json

from .base import BaseClientOut, Consumer


class SiteConsumer(Consumer):
    async def handle(self, msg):
        match msg:
            case c_out.GameCreate(data):
                response = p_in.GameCreate(sri=self.ctx.sri, data=data)
                await self.pub.publish(EngChan.game(), response)
            case _:
                await self.global_handle(msg)

    async def receive(self):
        msg = await self.websocket.receive_text()
        return json.decode(msg, type_arg=SiteClientOut)

    async def disconnect(self):
        pass


type SiteClientOut = BaseClientOut | c_out.GameCreate
