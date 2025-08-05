from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from game.models import Game
from .idgenerator import game_id_generator
from .idprovider import AsyncIdProvider


async def new_game():
    return await Game.create_game()


@database_sync_to_async
def create_game_db(game_id):
    Game.objects.create(game_id=game_id, status=Game.Status.CREATED)


class Game:
    channel_layer = get_channel_layer()
    id_provider = AsyncIdProvider(game_id_generator, batch=256)

    def __init__(self, game_id):
        self.id = game_id

    @classmethod
    async def create_game(cls):
        id = await cls.id_provider.one()
        await create_game_db(id=id)
        return Game(game_id=id)
