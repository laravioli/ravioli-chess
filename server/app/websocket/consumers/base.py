import asyncio
import logging
from typing import Any, ClassVar

from fastapi.websockets import WebSocket, WebSocketDisconnect

from app.deps import BroadCastClient
from app.websocket.schemas import MaybeUser, Sri
from core.ipc import ClientIn, p_out
from core.ipc.channels import ConsumerChan, UserChan, WebsocketChan
from core.ipc.types import ClientFrameOut, ProcessFrameOut
from lib.serializers import json

logger = logging.getLogger(__name__)


class Consumer:
    c_out_frame: ClassVar[ClientFrameOut]
    p_out_frame: ClassVar[ProcessFrameOut]

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        subclass_client_frame = getattr(cls, "c_out_frame", Any)
        subclass_process_frame = getattr(cls, "p_out_frame", Any)

        cls.p_out_frame = p_out.TellSocket | p_out.TellUser | subclass_process_frame
        cls.c_out_frame = str | subclass_client_frame

    def __init__(
        self, sri: Sri, user: "MaybeUser", websocket: WebSocket, broadcast: BroadCastClient
    ):
        self.sri = sri
        self.user = user
        self.websocket = websocket
        self.broadcast = broadcast
        self.channels: list[WebsocketChan] = [ConsumerChan(sri)]

        if user:
            self.channels.append(UserChan(user.id))

    # main coroutine
    async def __call__(self):
        await self.websocket.accept()

        try:
            async with asyncio.TaskGroup() as tg:
                task = tg.create_task(self.handle_broadcast())
                async for msg in self.receive_iter_json(type_arg=self.c_out_frame):
                    await self.handle_client_msg(msg)
                task.cancel()
        except* WebSocketDisconnect:
            pass
        finally:
            await self.disconnect()

    # process
    async def handle_broadcast(self):
        if self.channels:
            async with self.broadcast.start_subscription(*self.channels) as sub:
                async for msg in sub.iter_message(type_arg=self.p_out_frame):
                    await self.handle_process_msg(msg)

    async def handle_process_msg(self, msg):
        """common message received from processes"""
        match msg:
            case p_out.TellUser(type, data):
                await self.send_json(ClientIn(type=type, data=data))
            case _:
                logger.info("receive unknow process msg")

    # client
    async def handle_client_msg(self, msg):
        """common message received from client"""
        match msg:
            case _:
                logger.info("receive unknow client msg")

    async def send_json(self, data):
        """send data to websocket client"""
        await self.websocket.send({"type": "websocket.send", "text": json.encode_as_str(data)})

    async def receive_iter_json[T](self, type_arg: type[T] = object):
        """stream received msg from websocket client"""
        while True:
            msg = await self.websocket.receive_text()
            yield json.decode(msg, type_arg=type_arg)

    async def disconnect(self):  # noqa: B027
        pass
