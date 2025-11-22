import asyncio
import msgspec
from functools import cached_property
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from game.models import Game
from ipc.channels import ChanGameCreate
from ipc.protocol import GameCreatePayload, GameCreateIn, GameCreateOut
from .background import BackgroundSubscriber
from .idprovider import AsyncIdProvider


async def new_game(id_provider: AsyncIdProvider, **kwargs):
    id = await id_provider.one()
    await create_game_db(game_id=id, **kwargs)
    return id


@database_sync_to_async
def create_game_db(game_id, **kwargs):
    Game.objects.create(game_id=game_id, status=Game.Status.CREATED, **kwargs)


class GameProvider(BackgroundSubscriber[ChanGameCreate]):

    def __init__(self, id_provider):
        self.id_provider = id_provider
        self._queue = asyncio.Queue()

    @cached_property
    def channel(self):
        return ChanGameCreate(1)

    def on_message(self, message):
        self._queue.put_nowait(message["data"])

    async def get_message(self):
        """return raw data received from pubsub"""
        return await self._queue.get()

    async def create_game(self, raw_data):
        msg = msgspec.json.decode(raw_data, type=GameCreateIn)

        id = await new_game(
            self.id_provider,
            white_player=msg.payload.white_player,
            black_player=msg.payload.black_player,
        )
        return id, msg

    async def stop(self):
        self._queue.shutdown()


class GameManager:

    def __init__(self, game_provider: GameProvider):
        self._tasks = set()
        self._actors = set()
        self._game_provider = game_provider

    def start(self):
        self._task = asyncio.create_task(self.run())

    async def run(self):
        while True:
            raw_data = await self._game_provider.get_message()
            task = asyncio.create_task(self.start_game_actor(raw_data))
            self._tasks.add(task)
            task.add_done_callback(self._tasks.discard)

    async def start_game_actor(self, raw_data):
        id, msg = await self._game_provider.create_game(raw_data)
        game = GameBase(id, msg.payload)
        actor = asyncio.create_task(game())
        self._actors.add(actor)
        actor.add_done_callback(self._actors.discard)
        response = GameCreateOut(game_id=id)
        await get_channel_layer().send(
            msg.channel, {"type": "game.create", "data": msgspec.json.encode(response)}
        )

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


class GameBase:

    def __init__(self, game_id, payload: GameCreatePayload):
        self.id = game_id
        self.wp = payload.white_player
        self.bp = payload.black_player

    async def __call__(self, *args, **kwds):
        pass
