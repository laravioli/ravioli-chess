import asyncio
from abc import ABC, abstractmethod
from collections.abc import Iterable
from dataclasses import dataclass
from typing import Any, cast
from uuid import UUID

from fastapi import WebSocket, WebSocketDisconnect

from app.websocket.env import WsEnv
from app.websocket.frame import ClientIn, c_out
from app.websocket.schemas import MaybeUser, Sri
from ravioli_core.env import CoreEnv
from ravioli_core.pubsub.types import Chan
from ravioli_core.serializers import json

from .heartbeat import HeartBeat
from .subscriber import Subscriber


@dataclass(frozen=True)
class Context:
    sri: Sri
    user: MaybeUser
    channels: Iterable[Chan]


class Consumer[T: Context = Context](ABC):
    def __init__(
        self,
        context: T,
        core_env: CoreEnv,
        env: WsEnv,
        websocket: WebSocket,
        heartbeat: HeartBeat,
    ):
        self.ctx = context
        self.core_env = core_env
        self.env = env
        self.broadcast = env.broadcast
        self.pub = core_env.pub
        self.users = env.users
        self.websocket = websocket
        self.heartbeat = heartbeat
        self._sub = Subscriber()
        self._background_task = set()

    @abstractmethod
    async def handle(self, msg): ...

    @abstractmethod
    async def receive(self) -> Any: ...

    @abstractmethod
    async def disconnect(self): ...

    async def __call__(self):
        await self.websocket.accept()
        try:
            async with self.broadcast.start_subscription(
                self._sub, self.ctx.user, self.ctx.channels
            ):
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
                    self.add_background_task(
                        self.env.notif.mark_all_read(self.core_env.engine, cast(UUID, user.id))
                    )

    def add_background_task(self, coro):
        task = asyncio.create_task(coro)
        self._background_task.add(task)
        task.add_done_callback(self._background_task.discard)


type BaseClientOut = str | c_out.Notified
