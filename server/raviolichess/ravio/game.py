import asyncio
import chess
import functools
import logging
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from raviolichess.game.models import Game
from raviolichess.ipc.channels import GameCreateChan, GameChan, GameGroupChan
from raviolichess.ipc.protocol import ravioIN, ravioOUT
from raviolichess.ipc.serializers import MsgpackSerializer
from .background import BackgroundSubscriber
from .manager import Manager
from .idprovider import AsyncIdProvider
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
        players = list(map(functools.partial(GameDB._get_user_from_qs, qs), usernames))

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

    async def create(self, msg: ravioIN.GameCreate):
        id = await self._id_provider.one()
        await self.create_game_db(
            game_id=id, white_player=msg.white_player, black_player=msg.black_player
        )

        return id


class GameQueue(BackgroundSubscriber[GameCreateChan]):

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

    def __init__(
        self,
        serializer: MsgpackSerializer,
        game_queue: GameQueue,
        game_db: GameDB,
        subscribe,
        unsubscribe,
    ):
        self.serializer = serializer
        self._game_queue = game_queue
        self._game_db = game_db
        self.subscribe = subscribe
        self.unsubscribe = unsubscribe
        self._start_tasks = set()
        self._actor_tasks = set()
        self._actor_channels: dict[str, asyncio.Queue] = {}

    def start(self) -> asyncio.Task:
        run_task = asyncio.create_task(self.run())
        return run_task

    async def run(self):
        try:
            while True:
                raw_msg = await self._game_queue.get_message()
                task = asyncio.create_task(self.start_one(raw_msg))
                self._start_tasks.add(task)
                task.add_done_callback(self._start_tasks.discard)
        finally:
            # cleanup
            await self.stop()

    async def start_one(self, raw_msg):
        msg: ravioIN.GameCreate = self.serializer.deserialize(
            raw_msg, type=ravioIN.GameCreate
        )
        id = await self._game_db.create(msg)

        send_channel = GameGroupChan(id)
        receive_channel = GameChan(id)

        ready = functools.partial(self.ready, msg.channel)
        send = functools.partial(self.send, send_channel)
        receive = functools.partial(self.receive, receive_channel)
        stop_actor = functools.partial(self.stop_actor, receive_channel)

        self._actor_channels[receive_channel] = asyncio.Queue()
        await self.subscribe(
            {receive_channel: functools.partial(self.on_message, receive_channel)}
        )

        game_actor = GameActor(
            game_id=id, white_player=msg.white_player, black_player=msg.black_player
        )

        actor = asyncio.create_task(game_actor(ready, send, receive, stop_actor))
        self._actor_tasks.add(actor)
        actor.add_done_callback(self._actor_tasks.discard)

    async def on_message(self, receive_channel, msg) -> None:
        if receive_channel in self._actor_channels:
            self._actor_channels[receive_channel].put_nowait(msg["data"])

    async def ready(self, ws_channel, id) -> None:
        await get_channel_layer().send(
            ws_channel,
            {
                "type": "game.created",
                "data": self.serializer.serialize(ravioOUT.GameCreate(id)),
            },
        )

    async def send(self, send_channel, type: str, msg: ravioOUT.Protocol):
        data = self.serializer.serialize(msg)
        await get_channel_layer().group_send(send_channel, {"type": type, "data": data})

    async def receive(self, receive_channel) -> ravioIN.Protocol:
        msg = await self._actor_channels[receive_channel].get()
        return self.serializer.deserialize(msg, type=ravioIN.Protocol)

    async def stop_actor(self, receive_channel) -> None:
        try:
            await self.unsubscribe(receive_channel)
        except BaseException:
            logger.exception("Error while unsubscribing actor")
        finally:
            del self._actor_channels[receive_channel]

    async def stop(self):
        for start_task in self._start_tasks:
            start_task.cancel()
        for actor in self._actor_tasks:
            actor.cancel()
        exc = await asyncio.gather(
            *self._start_tasks, *self._actor_tasks, return_exceptions=True
        )
        logger.debug(exc)


class GameActor:

    def __init__(self, *, game_id, white_player, black_player):
        self.game_id = game_id
        self.white_player = white_player
        self.black_player = black_player
        self._board = chess.Board()

    async def __call__(self, ready, send, receive, stop):
        try:
            await ready(self.game_id)
            while True:
                msg = await receive()
                type, response, should_stop = self.handle_message(msg)
                if response:
                    await send(type, response)
                if should_stop:
                    raise GameStop()
        except asyncio.CancelledError:
            logger.debug("Game actor cancelled %s", self.game_id)
            raise
        except GameStop:
            logger.debug("Stop game actor %s", self.game_id)
        finally:
            # cleanup
            await stop()

    def handle_message(
        self, msg: ravioIN.Protocol
    ) -> tuple[str, ravioOUT.Protocol, bool]:
        type, response = None, None
        should_stop = False

        match msg:
            case ravioIN.GameMove(san):
                type = "game.move"
                try:
                    self._board.push_san(san)
                    response = ravioOUT.GameMove(ok=True, san=san)
                except ValueError:
                    response = ravioOUT.GameMove(ok=False, san=san)
                    should_stop = True
            case _:
                logger.warning("Unknown message received: %s", msg)
                should_stop = True

        return type, response, should_stop
