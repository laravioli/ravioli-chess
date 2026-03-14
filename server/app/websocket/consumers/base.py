import asyncio
from abc import ABC, abstractmethod

from fastapi.websockets import WebSocket, WebSocketDisconnect

from app.deps import BroadCastClient
from app.websocket.utils import new_channel
from core.ipc.schemas import ravioOUT
from core.serializers import json


class BaseConsumer(ABC):
    def __init__(self, websocket: WebSocket, broadcast: BroadCastClient):
        self.websocket = websocket
        self.broadcast = broadcast
        self.channel_name = new_channel()

    async def __call__(self):
        await self.websocket.accept()

        try:
            async with asyncio.TaskGroup() as tg:
                task = tg.create_task(self.handle_broadcast())
                await self.handle_client()
                task.cancel()
        except* WebSocketDisconnect:
            pass
        finally:
            await self.disconnect()

    @property
    @abstractmethod
    def channels(self) -> list[str]: ...

    @abstractmethod
    async def handle_client(self): ...

    async def handle_broadcast(self):
        async with self.broadcast.start_subscription(*self.channels) as sub:
            async for msg in sub.iter_message(type=ravioOUT.Protocol):
                handler = getattr(self, msg["type"])
                await handler(msg)

    async def send_json(self, data):
        """send data to websocket client"""
        await self.websocket.send({"type": "websocket.send", "text": json.encode_as_str(data)})

    async def receive_json[T](self, type: type[T] = object):
        """receive data from websocket client"""
        msg = await self.websocket.receive_text()
        return json.decode(msg, type=type)

    async def disconnect(self):  # noqa: B027
        pass
