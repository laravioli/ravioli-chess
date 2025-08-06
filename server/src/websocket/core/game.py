from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from game.models import Game
from .idprovider import AsyncIdProvider


@database_sync_to_async
def create_game_db(game_id):
    Game.objects.create(game_id=game_id, status=Game.Status.CREATED)


async def new_game(id_provider: AsyncIdProvider):
    id = await id_provider.one()
    await create_game_db(game_id=id)
    return id
