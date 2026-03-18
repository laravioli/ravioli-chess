import asyncio
from contextlib import suppress

from core.ipc import engine_in, engine_out
from core.ipc.channels import EngineGameChan, EngineGameCreateChan, WsGameChan
from core.ipc.structs import GameRouting, ServerMsg
from engine.utils import register_coroutine
from lib.pubsub import Broadcast

from .actor import GameActor
from .service import create_game_db


class GameManager:
    """Start and manage game tasks"""

    def __init__(
        self,
        broadcast: Broadcast,
    ):
        self.broadcast = broadcast
        self._start_tasks: set[asyncio.Task] = set()
        self._actor_tasks: set[asyncio.Task] = set()
        self._actor_channels: dict[str, asyncio.Queue] = {}

    async def run(self):
        try:
            async with self.broadcast.start_subscription(EngineGameCreateChan(1)) as subscriber:
                async for message in subscriber.iter_message(type_arg=engine_in.GameStart):
                    register_coroutine(self._start_tasks, self.start_one, message)
        finally:
            for task in self._start_tasks:
                task.cancel()
            exc = await asyncio.gather(*self._start_tasks, return_exceptions=True)
            exc += await asyncio.gather(*self._actor_tasks, return_exceptions=True)

    async def start(self):
        self._task = asyncio.create_task(self.run())

    async def stop(self):
        if self._task:
            self._task.cancel()
            with suppress(asyncio.CancelledError):
                await self._task

    async def publish(self, channel, msg):
        await self.broadcast.publish(channel, ServerMsg(source="engine", msg=msg))

    async def start_one(self, msg: engine_in.GameStart):
        id = await create_game_db(msg)

        send_channel = WsGameChan(id)
        receive_channel = EngineGameChan(id)

        # actor api
        async def receive():
            await self.publish(msg.channel, engine_out.GameCreate(data=GameRouting(id)))
            async with self.broadcast.start_subscription(receive_channel) as sub:
                async for message in sub.iter_message(type_arg=engine_in.GameProtocol):
                    yield message

        async def send(msg: engine_out.GameProtocol):
            await self.publish(send_channel, msg)

        # start actor
        actor = GameActor(info=msg.data)
        register_coroutine(self._actor_tasks, actor, receive, send)
