import asyncio
import functools
import logging
from channels.layers import get_channel_layer
from raviolichess.ipc.channels import GameCreateChan, GameChan, GameGroupChan
from raviolichess.ipc.protocol import ravioIN, ravioOUT
from raviolichess.ipc.serializers import msgpack
from raviolichess.ravio.background import BackgroundSubscriber
from raviolichess.ravio.manager import Manager
from .db import GameDB
from .actor import GameActor
from raviolichess.ravio.utils import register_coro


logger = logging.getLogger(__name__)


class GameQueue(BackgroundSubscriber[GameCreateChan]):
    """transport layer of game creation request"""

    def __init__(self, pid):
        self._pid = pid
        self._queue = asyncio.Queue()

    @functools.cached_property
    def channel(self):
        return GameCreateChan(self._pid)

    def on_message(self, message):
        "pubsub handler to fill queue"
        self._queue.put_nowait(message["data"])

    async def get_message(self):
        """return raw data received from pubsub"""
        return await self._queue.get()


class GameManager(Manager):
    """Start actors, handle transport layer from pubsub to actors, clean ressources"""

    def __init__(
        self,
        game_queue,
        game_db,
        subscribe,
        unsubscribe,
    ):
        self._game_queue: GameQueue = game_queue
        self._game_db: GameDB = game_db
        self._start_tasks: set[asyncio.Task] = set()
        self._actor_tasks: set[asyncio.Task] = set()
        self._actor_channels: dict[str, asyncio.Queue] = {}
        self.subscribe = subscribe
        self.unsubscribe = unsubscribe

    async def run(self):
        try:
            while True:
                raw_msg = await self._game_queue.get_message()
                register_coro(self._start_tasks, self.start_one, raw_msg)

        finally:
            # cleanup
            await self.stop()

    async def stop(self):
        for task in self._start_tasks:
            task.cancel()
        exc = await asyncio.gather(*self._start_tasks, return_exceptions=True)
        # let actors send their last words
        for queue in self._actor_channels.values():
            queue.shutdown()
        exc += await asyncio.gather(*self._actor_tasks, return_exceptions=True)

        logger.debug(exc)

    async def start_one(self, raw_msg):
        msg: ravioIN.GameCreate = msgpack.decode(raw_msg, type=ravioIN.GameStart)

        try:
            id = await self._game_db.new_game(msg)
        except BaseException:
            logger.exception("unable to create a new game")
        else:
            send_channel = GameGroupChan(id)
            receive_channel = GameChan(id)

            # actor api
            ready = functools.partial(self.ready, msg.channel, id)
            send = functools.partial(self.send, send_channel)
            receive = functools.partial(self.receive, receive_channel)
            stop_actor = functools.partial(self.stop_actor, receive_channel, id)

            # actor transport
            self._actor_channels[receive_channel] = asyncio.Queue()
            await self.subscribe(
                {receive_channel: functools.partial(self.on_message, receive_channel)}
            )

            # start actor
            actor = GameActor(
                white_player=msg.white_player, black_player=msg.black_player
            )
            register_coro(self._actor_tasks, actor, ready, send, receive, stop_actor)

    async def on_message(self, receive_channel, msg) -> None:
        if receive_channel in self._actor_channels:
            self._actor_channels[receive_channel].put_nowait(msg["data"])

    async def ready(self, ws_channel, id) -> None:
        await get_channel_layer().send(
            ws_channel, ravioOUT.GameCreate(data=ravioOUT.GameCreate.Payload(id))
        )

    async def send(self, send_channel, msg: ravioOUT.Protocol):
        "send to asgi consumers, channel redis layer"

        await get_channel_layer().group_send(send_channel, msg)

    async def receive(self, receive_channel) -> ravioIN.GameProtocol:
        "receive from asgi consumer, ravioli layer"
        msg = await self._actor_channels[receive_channel].get()
        return msgpack.decode(msg, type=ravioIN.GameProtocol)

    async def stop_actor(self, receive_channel, id) -> None:
        try:
            await self.unsubscribe(receive_channel)
        # catch all to not swallow termination exception
        except BaseException:
            logger.exception("Error while stopping actor %s", id)
        finally:
            del self._actor_channels[receive_channel]
            logger.debug("stop game actor %s", id)
