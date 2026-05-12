import asyncio
from abc import ABC, abstractmethod
from collections.abc import Iterable
from dataclasses import dataclass

from fastapi import WebSocket, WebSocketDisconnect

from app.deps import BroadCastClient, Env
from app.websocket.schemas import MaybeUser, Sri
from ravioli_core.ipc import ClientIn, c_out
from ravioli_core.ipc.channels import WebsocketChan
from ravioli_core.serializers import json

from .heartbeat import HeartBeat
from .sub import Subscriber


@dataclass(frozen=True)
class Context:
    sri: Sri
    user: MaybeUser
    channels: Iterable[WebsocketChan]


class Consumer[T: Context = Context](ABC):
    def __init__(
        self,
        context: T,
        websocket: WebSocket,
        broadcast: BroadCastClient,
        heartbeat: HeartBeat,
    ):
        self.ctx = context
        self.websocket = websocket
        self.broadcast = broadcast
        self.heartbeat = heartbeat
        self._sub = Subscriber()
        self._background_task = set()

    @abstractmethod
    async def handle(self, msg): ...

    @abstractmethod
    async def receive(self): ...

    @abstractmethod
    async def disconnect(self): ...

    async def __call__(self):
        await self.websocket.accept()

        try:
            async with self.broadcast.start_subscription(self._sub, *self.ctx.channels):
                async with asyncio.TaskGroup() as tg:
                    tg.create_task(self.receive_iter())
                    async for msg in self._sub.iter_message():
                        await self.handle(msg)
        except* WebSocketDisconnect:
            pass
        finally:
            await self.disconnect()

    async def receive_iter(self):
        while True:
            msg = await self.receive()
            self._sub.put_nowait(msg)

    async def send_json(self, data):
        await self.websocket.send_text(json.encode_as_str(data))

    async def global_handle(self, msg):
        match msg:
            case "p":
                await self.heartbeat.pong()
            case ClientIn():
                await self.send_json(msg)
            case c_out.Notified():
                user = self.ctx.user
                if user:
                    env: Env = self.websocket.state["env"]
                    self.add_background_task(env.service.notif.mark_all_read(env.engine, user.id))

    def add_background_task(self, coro):
        task = asyncio.create_task(coro)
        self._background_task.add(task)
        task.add_done_callback(self._background_task.discard)


type BaseClientOut = str | c_out.Notified
