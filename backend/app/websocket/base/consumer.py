import asyncio
import logging

from fastapi.websockets import WebSocket, WebSocketDisconnect

from app.deps import BroadCastClient
from app.websocket.heartbeat import HeartBeat
from app.websocket.schemas import MaybeUser, Sri
from ravioli_core.ipc import ClientIn, p_out
from ravioli_core.ipc.channels import WebsocketChan
from ravioli_core.serializers import json

from .messages import MessageTypes
from .protocol import ConsumerProtocol

logger = logging.getLogger(__name__)


class Consumer:
    def __init__(
        self,
        sri: Sri,
        user: "MaybeUser",
        channels: list[WebsocketChan],
        message_types: MessageTypes,
        protocol: ConsumerProtocol,
        websocket: WebSocket,
        broadcast: BroadCastClient,
        heartbeat: HeartBeat,
    ):
        self.sri = sri
        self.user = user
        self.channels = channels
        self.message_types = message_types
        self.protocol = protocol
        self.websocket = websocket
        self.broadcast = broadcast
        self.heartbeat = heartbeat

    async def __call__(self):
        await self.websocket.accept()

        try:
            async with asyncio.TaskGroup() as tg:
                task = tg.create_task(self.handle_broadcast())
                async for msg in self.receive_iter_json(type_arg=self.message_types["client"]):
                    await self.handle_client_msg(msg)
                task.cancel()
        except* WebSocketDisconnect:
            pass
        finally:
            await self.disconnect()

    async def handle_broadcast(self):
        if self.channels:
            async with self.broadcast.start_subscription(*self.channels) as sub:
                async for msg in sub.iter_message(type_arg=self.message_types["process"]):
                    await self.handle_process_msg(msg)

    async def handle_process_msg(self, msg):
        match msg:
            case p_out.TellUser(type, data):
                await self.send_json(ClientIn(type=type, data=data))
            case _:
                await self.protocol.process_protocol(msg)

    async def handle_client_msg(self, msg):
        match msg:
            case "p":
                await self.heartbeat.pong()
            case _:
                await self.protocol.client_protocol(msg)

    async def send_json(self, data):
        await self.websocket.send_text(json.encode_as_str(data))

    async def receive_iter_json[T](self, type_arg: type[T] = object):
        while True:
            msg = await self.websocket.receive_text()
            yield json.decode(msg, type_arg=type_arg)

    async def disconnect(self):  # noqa: B027
        await self.protocol.disconnect()
