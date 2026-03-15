import asyncio
from contextlib import suppress

from core.protocol.channels import engine_chan, websocket_chan
from core.protocol.schemas import engine_in, engine_out
from engine.utils import register_coroutine
from lib.pubsub import Broadcast

from .actor import GameActor


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
            async with self.broadcast.start_subscription(engine_chan.GameCreate(1)) as subscriber:
                async for message in subscriber.iter_message(type=engine_in.GameStart):
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

    async def start_one(self, msg: engine_in.GameStart):
        # note: id will be async (result from db)
        id = "AAAAAAAA"

        send_channel = websocket_chan.Game(id)
        receive_channel = engine_chan.Game(id)

        # actor api
        async def receive():
            await self.broadcast.publish(
                msg.channel, engine_out.GameCreate(data=engine_out.GameCreate.Payload(id))
            )
            async with self.broadcast.start_subscription(receive_channel) as sub:
                async for message in sub.iter_message(type=engine_in.GameProtocol):
                    yield message

        async def send(msg: engine_out.GameProtocol):
            await self.broadcast.publish(send_channel, msg)

        # start actor
        actor = GameActor(
            white_player=msg.payload.white_player, black_player=msg.payload.black_player
        )
        register_coroutine(self._actor_tasks, actor, receive, send)
