import asyncio
from channels.db import database_sync_to_async
from game.models import Game
from .background import BackgroundSubscriber
from ipc.channels import ChanGameCreate
from .idprovider import AsyncIdProvider
from functools import cached_property


@database_sync_to_async
def create_game_db(game_id):
    Game.objects.create(game_id=game_id, status=Game.Status.CREATED)


# pretty bad to expose id_provider
async def new_game(id_provider: AsyncIdProvider):
    id = await id_provider.one()
    await create_game_db(game_id=id)
    return id


class GameCreator(BackgroundSubscriber[ChanGameCreate]):

    def __init__(self, id_provider):
        self.id_provider = id_provider
        self._queue = asyncio.Queue()

    @cached_property
    def channel(self):
        return ChanGameCreate(1)

    def on_message(self, message):
        self._queue.put_nowait(message)

    async def create_game(self):
        message = await self._queue.get()


class GameManager:

    def __init__(self):
        self.router = {}
        self.game_creator = GameCreator(self)


class GameBase:

    async def __call__(self, *args, **kwds):
        pass
