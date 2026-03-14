import asyncio
import logging
from contextlib import suppress

from core.ipc.channels import GameChan, GameCreateChan, GameGroupChan
from core.ipc.schemas import EngineIn, EngineOut
from core.pubsub import Broadcast
from engine.utils import register_coroutine

from .actor import GameActor

logger = logging.getLogger(__name__)


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
            async with self.broadcast.start_subscription(GameCreateChan(1)) as subscriber:
                async for message in subscriber.iter_message(type=EngineIn.GameStart):
                    register_coroutine(self._start_tasks, self.start_one, message)
        finally:
            for task in self._start_tasks:
                task.cancel()
            exc = await asyncio.gather(*self._start_tasks, return_exceptions=True)
            exc += await asyncio.gather(*self._actor_tasks, return_exceptions=True)
            logger.info(exc)

    async def start(self):
        self._task = asyncio.create_task(self.run())

    async def stop(self):
        if self._task:
            self._task.cancel()
            with suppress(asyncio.CancelledError):
                await self._task

    async def start_one(self, msg: EngineIn.GameStart):
        # note: id will be async (result from db)
        id = "AAAAAAAA"

        send_channel = GameGroupChan(id)
        receive_channel = GameChan(id)

        # actor api
        async def receive():
            await self.broadcast.publish(
                msg.channel, EngineOut.GameCreate(data=EngineOut.GameCreate.Payload(id))
            )
            async with self.broadcast.start_subscription(receive_channel) as sub:
                async for message in sub.iter_message(type=EngineIn.GameProtocol):
                    yield message

        async def send(msg: EngineOut.GameProtocol):
            await self.broadcast.publish(send_channel, msg)

        # start actor
        actor = GameActor(white_player=msg.white_player, black_player=msg.black_player)
        register_coroutine(self._actor_tasks, actor, receive, send)
