import asyncio
import uuid
from abc import ABC, abstractmethod

from fastapi.websockets import WebSocket, WebSocketDisconnect

from app.deps import BroadCastClient
from core.protocol.channels import websocket_chan
from core.protocol.schemas import app_out, client_out, engine_out
from core.protocol.schemas._base import BroadcastEnvelope
from lib.serializers import json, msgpack


class BaseConsumer(ABC):
    def __init__(self, websocket: WebSocket, broadcast: BroadCastClient):
        self.websocket = websocket
        self.broadcast = broadcast
        self.channel_name = websocket_chan.Socket(uuid.uuid4())

    @property
    @abstractmethod
    def channels(self) -> tuple[str]: ...

    async def handle_app_msg(self, msg: app_out.Protocol):  # noqa: B027
        pass

    @abstractmethod
    async def handle_client_msg(self, msg: client_out.Protocol): ...

    @abstractmethod
    async def handle_engine_msg(self, msg: engine_out.Protocol): ...

    async def __call__(self):
        await self.websocket.accept()

        try:
            async with asyncio.TaskGroup() as tg:
                task = tg.create_task(self.handle_broadcast())
                async for msg in self.receive_iter_json(type=client_out.Protocol):
                    await self.handle_client_msg(msg)
                task.cancel()
        except* WebSocketDisconnect:
            pass
        finally:
            await self.disconnect()

    async def handle_broadcast(self):
        if self.channels:
            async with self.broadcast.start_subscription(*self.channels) as sub:
                async for enveloppe in sub.iter_message(type=BroadcastEnvelope):
                    if enveloppe.source == "engine":
                        await self.handle_engine_msg(
                            msgpack.decode(enveloppe.msg, type=engine_out.Protocol)
                        )
                    elif enveloppe.source == "app":
                        await self.handle_app_msg(
                            msgpack.decode(enveloppe.msg, type=app_out.Protocol)
                        )
                    else:
                        raise ValueError("Invalid message source")

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
