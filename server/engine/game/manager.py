import asyncio
import logging

from core.ipc.channels import GameChan, GameCreateChan, GameGroupChan
from core.ipc.schemas import ravioIN, ravioOUT
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

    async def start(self):
        async with self.broadcast.start_subscription(GameCreateChan(1)) as subscriber:
            async for message in subscriber.iter_message(type=ravioIN.GameStart):
                register_coroutine(self._start_tasks, self.start_one, message)

    async def stop(self):
        for task in self._start_tasks:
            task.cancel()
        exc = await asyncio.gather(*self._start_tasks, return_exceptions=True)
        # let actors drain their queue
        await self.broadcast.stop(immediate=False)
        exc += await asyncio.gather(*self._actor_tasks, return_exceptions=True)
        logger.debug(exc)

    async def start_one(self, msg: ravioIN.GameStart):
        id = "AAAAAAAA"

        send_channel = GameGroupChan(id)
        receive_channel = GameChan(id)

        # actor api
        async def receive():
            await self.broadcast.publish(
                msg.channel, ravioOUT.GameCreate(data=ravioOUT.GameCreate.Payload(id))
            )
            async with self.broadcast.start_subscription(receive_channel) as sub:
                async for message in sub.iter_message(type=ravioIN.GameProtocol):
                    yield message

        async def send(msg: ravioOUT.Protocol):
            await self.broadcast.publish(send_channel, msg)

        # start actor
        actor = GameActor(white_player=msg.white_player, black_player=msg.black_player)
        register_coroutine(self._actor_tasks, actor, receive, send)
