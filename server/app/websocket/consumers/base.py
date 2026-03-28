import asyncio
import uuid
from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

from fastapi.websockets import WebSocket, WebSocketDisconnect

from app.deps import BroadCastClient
from core.ipc import app_out, client_out, engine_out
from core.ipc.channels import ConsumerChan, UserChan
from core.ipc.structs import ServerMsg
from lib.serializers import json, msgpack

if TYPE_CHECKING:
    from app.websocket.deps import MaybeUser


class AbstractBaseConsumer(ABC):
    @property
    @abstractmethod
    def channels(self) -> tuple[str]: ...

    async def handle_app_msg(self, msg: app_out.Protocol):  # noqa: B027
        pass

    @abstractmethod
    async def handle_client_msg(self, msg: client_out.Protocol): ...

    @abstractmethod
    async def handle_engine_msg(self, msg: engine_out.Protocol): ...


class BaseConsumer(AbstractBaseConsumer):
    def __init__(self, user: "MaybeUser", websocket: WebSocket, broadcast: BroadCastClient):
        self.user = user
        self.websocket = websocket
        self.broadcast = broadcast
        self.consumer_channel = ConsumerChan(uuid.uuid4())
        self.user_channel = UserChan(str(user.id)) if user else None

    async def __call__(self):
        await self.websocket.accept()

        try:
            async with asyncio.TaskGroup() as tg:
                task = tg.create_task(self.handle_broadcast())
                async for msg in self.receive_iter_json(type_arg=client_out.Protocol):
                    await self.handle_client_msg(msg)
                task.cancel()
        except* WebSocketDisconnect:
            pass
        finally:
            await self.disconnect()

    async def handle_broadcast(self):
        if self.channels:
            async with self.broadcast.start_subscription(*self.channels) as sub:
                async for server_msg in sub.iter_message(type_arg=ServerMsg):
                    if server_msg.source == "engine":
                        await self.handle_engine_msg(
                            msgpack.decode(server_msg.msg, type_arg=engine_out.Protocol)
                        )
                    elif server_msg.source == "app":
                        await self.handle_app_msg(
                            msgpack.decode(server_msg.msg, type_arg=app_out.Protocol)
                        )
                    else:
                        raise ValueError("Invalid message source")

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
