import asyncio
import msgspec
import logging
import chess
from abc import ABC
from functools import cached_property, partial
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from .background import BackgroundSubscriber
from .idprovider import AsyncIdProvider
from game.models import Game
from ipc.channels import ChanGameCreate, ChanGame
from ipc.protocol.game import *
from .exceptions import GameStop

user_model = get_user_model()

logger = logging.getLogger(__name__)


class GameDB:

    def __init__(self, id_provider):
        self._id_provider: AsyncIdProvider = id_provider

    @staticmethod
    @database_sync_to_async
    def create_game_db(game_id, white_player=None, black_player=None):
        usernames = [white_player, black_player]
        qs = user_model.objects.filter(username__in=usernames)
        players = list(map(partial(GameDB._get_user_from_qs, qs), usernames))

        Game.objects.create(
            game_id=game_id,
            white_player=players[0],
            black_player=players[1],
            status=Game.Status.CREATED,
        )

    @staticmethod
    def _get_user_from_qs(qs, player):
        if player:
            for user in qs:
                if user.username == player:
                    return user
        return None

    async def create(self, msg: GameCreateIn):
        id = await self._id_provider.one()
        await self.create_game_db(
            game_id=id, white_player=msg.white_player, black_player=msg.black_player
        )
        return id


class QueueMixin(ABC):

    _queue: asyncio.Queue

    def on_message(self, message):
        "pubsub handler to fill queue"
        self._queue.put_nowait(message["data"])

    async def get_message(self):
        """return raw data received from pubsub"""
        return await self._queue.get()


class GameQueue(QueueMixin, BackgroundSubscriber[ChanGameCreate]):

    def __init__(self, pid):
        self._pid = pid
        self._queue = asyncio.Queue()

    @cached_property
    def channel(self):
        return ChanGameCreate(self._pid)

    async def stop(self):
        self._queue.shutdown()


class GameManager:

    def __init__(self, game_queue: GameQueue, game_db: GameDB):
        self._tasks = set()
        self._actors = set()
        self._queue = game_queue
        self._db = game_db

    def start(self, subscribe, unsubscribe):
        self.subscribe = subscribe
        self.unsubscribe = unsubscribe
        self._task = asyncio.create_task(self.run())

    async def run(self):
        while True:
            raw_data = await self._queue.get_message()
            task = asyncio.create_task(self.start_game(raw_data))
            self._tasks.add(task)
            task.add_done_callback(self._tasks.discard)

    async def start_game(self, raw_data):
        msg = msgspec.json.decode(raw_data, type=GameCreateIn)
        id = await self._db.create(msg)
        actor = self.start_game_actor(id, msg)
        self._actors.add(actor)
        actor.add_done_callback(self._actors.discard)

    def start_game_actor(self, id, msg: GameCreateIn):
        game = GameActor(
            game_id=id, white_player=msg.white_player, black_player=msg.black_player
        )
        ready_signal = partial(get_channel_layer().send, msg.channel)
        actor = asyncio.create_task(
            game(ready_signal, self.subscribe, self.unsubscribe)
        )
        return actor

    async def stop(self):
        self._task.cancel()
        try:
            await self._task
        except asyncio.CancelledError:
            pass
        for actor in self._actors:
            actor.cancel()
        await asyncio.gather(*self._actors, return_exceptions=True)
        self._actors.clear()


class GameActor(QueueMixin):

    def __init__(self, *, game_id, white_player, black_player):
        self.id = game_id
        self.white_player = white_player
        self.black_player = black_player
        self._board = chess.Board()
        self._queue = asyncio.Queue()

    @cached_property
    def channel(self):
        return ChanGame(self.id)

    async def start(self, send_ready, subscribe):
        logger.info("starting game actor %s", self.id)
        await subscribe(**{self.channel.chan: self.on_message})
        await send_ready(
            {
                "type": "game.created",
                "data": msgspec.json.encode(GameCreateOut(self.id)),
            }
        )

    async def __call__(self, send_ready, subscribe, unsubscribe):
        await self.start(send_ready=send_ready, subscribe=subscribe)
        try:
            while True:
                raw_data = await self.get_message()
                msgspec.json.decode(raw_data, type=GameProtocol)
                await self.handle_message()
        except GameStop:
            logger.info("stop game actor %s", self.id)
            pass
        finally:
            unsubscribe(self.channel)

    async def handle_message(self, msg):
        match msg:
            case MoveIn(san):
                try:
                    logger.info("move played : %s", san)
                    self._board.push_san(san)
                except ValueError() as exc:
                    logger.exception(exc, exc_info=True)
                    raise GameStop()
            case _:
                raise GameStop()
