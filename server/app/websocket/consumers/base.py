import asyncio
import uuid
from abc import ABC, abstractmethod

from fastapi.websockets import WebSocket, WebSocketDisconnect

from app.deps import BroadCastClient
from core.ipc.channels import WsChan
from core.ipc.schemas import ClientOut, EngineOut
from core.serializers import json


class BaseConsumer(ABC):
    def __init__(self, websocket: WebSocket, broadcast: BroadCastClient):
        self.websocket = websocket
        self.broadcast = broadcast
        self.channel_name = WsChan.Socket(uuid.uuid4())

    @property
    @abstractmethod
    def channels(self) -> tuple[str]: ...

    @abstractmethod
    async def handle_client_msg(self, msg: ClientOut.Protocol): ...

    async def __call__(self):
        await self.websocket.accept()

        try:
            async with asyncio.TaskGroup() as tg:
                task = tg.create_task(self.handle_broadcast())
                async for msg in self.receive_iter_json(type=ClientOut.Protocol):
                    await self.handle_client_msg(msg)
                task.cancel()
        except* WebSocketDisconnect:
            pass
        finally:
            await self.disconnect()

    async def handle_broadcast(self):
        if self.channels:
            async with self.broadcast.start_subscription(*self.channels) as sub:
                async for msg in sub.iter_message(type=EngineOut.Protocol):
                    handler = getattr(self, msg["t"])
                    await handler(msg)

    async def send_json(self, data):
        """send data to websocket client"""
        await self.websocket.send({"type": "websocket.send", "text": json.encode_as_str(data)})

    async def receive_iter_json[T](self, type: type[T] = object):
        """stream received msg from websocket client"""
        while True:
            msg = await self.websocket.receive_text()
            yield json.decode(msg, type=type)

    async def disconnect(self):  # noqa: B027
        pass
