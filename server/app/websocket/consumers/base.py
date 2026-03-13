import asyncio
from abc import ABC, abstractmethod

from fastapi.websockets import WebSocket, WebSocketDisconnect

from app.deps import BroadCastClient
from core.serializers import json


class BaseConsumer(ABC):
    def __init__(self, websocket: WebSocket, broadcast: BroadCastClient):
        self.websocket = websocket
        self.broadcast = broadcast

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

    async def send_json(self, data):
        """send data to websocket client"""
        await self.websocket.send({"type": "websocket.send", "text": json.encode_as_str(data)})

    async def receive_json[T](self, type: type[T] = object):
        """receive data from websocket client"""
        msg = await self.websocket.receive_text()
        return json.decode(msg, type=type)

    @abstractmethod
    async def handle_client(self): ...

    @abstractmethod
    async def handle_broadcast(self): ...

    async def disconnect(self):  # noqa: B027
        pass
