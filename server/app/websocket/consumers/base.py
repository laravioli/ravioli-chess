import asyncio
import uuid
from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, ClassVar

from fastapi.websockets import WebSocket, WebSocketDisconnect

from app.deps import BroadCastClient
from core.ipc.channels import ConsumerChan
from core.ipc.types import ClientFrameOut, ProcessFrameOut
from lib.serializers import json

if TYPE_CHECKING:
    from app.websocket.deps import MaybeUser


class AbstractBaseConsumer(ABC):
    c_out_frame: ClassVar[ClientFrameOut]
    p_out_frame: ClassVar[ProcessFrameOut]

    @property
    @abstractmethod
    def channels(self) -> tuple[str]: ...

    @abstractmethod
    async def handle_client_msg(self, msg): ...

    @abstractmethod
    async def handle_process_msg(self, msg): ...


class BaseConsumer(AbstractBaseConsumer):
    def __init__(self, user: "MaybeUser", websocket: WebSocket, broadcast: BroadCastClient):
        self.user = user
        self.websocket = websocket
        self.broadcast = broadcast
        self.consumer_channel = ConsumerChan(uuid.uuid4())

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

    async def handle_broadcast(self):
        if self.channels:
            async with self.broadcast.start_subscription(*self.channels) as sub:
                async for msg in sub.iter_message(type_arg=self.p_out_frame):
                    await self.handle_process_msg(msg)

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
