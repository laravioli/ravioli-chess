import asyncio
import logging
from typing import Any, ClassVar

from fastapi.websockets import WebSocket, WebSocketDisconnect

from app.deps import BroadCastClient
from app.websocket.heartbeat import HeartBeat
from app.websocket.schemas import MaybeUser, Sri
from ravioli_core.ipc import ClientIn, p_out
from ravioli_core.ipc.channels import ConsumerChan, UserChan, WebsocketChan
from ravioli_core.ipc.types import ClientOUT, ProcessOUT
from ravioli_core.serializers import json

logger = logging.getLogger(__name__)


class Consumer:
    ## INIT ##
    CLIENT_OUT_FRAME: ClassVar[ClientOUT | str]
    PROCESS_OUT_FRAME: ClassVar[ProcessOUT]

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        client_frame = getattr(cls, "CLIENT_OUT_FRAME", Any)
        process_frame = getattr(cls, "PROCESS_OUT_FRAME", Any)

        cls.PROCESS_OUT_FRAME = p_out.TellSocket | p_out.TellUser | process_frame
        cls.CLIENT_OUT_FRAME = str | client_frame

    def __init__(
        self,
        sri: Sri,
        user: "MaybeUser",
        websocket: WebSocket,
        broadcast: BroadCastClient,
        heartbeat: HeartBeat,
    ):
        self.sri = sri
        self.user = user
        self.websocket = websocket
        self.broadcast = broadcast
        self.heartbeat = heartbeat

        # subclasses can append channels on __init__
        self.channels: list[WebsocketChan] = [ConsumerChan(sri)]
        if user:
            self.channels.append(UserChan(user.id))

    ## LOOP ##
    async def __call__(self):
        await self.websocket.accept()

        try:
            async with asyncio.TaskGroup() as tg:
                task = tg.create_task(self.handle_broadcast())
                async for msg in self.receive_iter_json(type_arg=self.CLIENT_OUT_FRAME):
                    await self.handle_client_msg(msg)
                task.cancel()
        except* WebSocketDisconnect:
            pass
        finally:
            await self.disconnect()

    async def handle_broadcast(self):
        if self.channels:
            async with self.broadcast.start_subscription(*self.channels) as sub:
                async for msg in sub.iter_message(type_arg=self.PROCESS_OUT_FRAME):
                    await self.handle_process_msg(msg)

    ## PROCESS FRAME ##
    async def handle_process_msg(self, msg):
        match msg:
            case p_out.TellUser(type, data):
                await self.send_json(ClientIn(type=type, data=data))
            case _:
                logger.info("receive unknow process msg")

    ## CLIENT FRAME ##
    async def handle_client_msg(self, msg):
        match msg:
            case "p":
                await self.heartbeat.pong()
            case _:
                logger.info("receive unknow client msg")

    async def send_json(self, data):
        await self.websocket.send({"type": "websocket.send", "text": json.encode_as_str(data)})

    async def receive_iter_json[T](self, type_arg: type[T] = object):
        while True:
            msg = await self.websocket.receive_text()
            yield json.decode(msg, type_arg=type_arg)

    async def disconnect(self):  # noqa: B027
        pass
