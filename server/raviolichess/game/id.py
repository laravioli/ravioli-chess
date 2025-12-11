import string
import random
from channels.db import database_sync_to_async
from .models import Game

ID_CHARS = string.ascii_letters + string.digits


def id8():
    return "".join(random.choice(ID_CHARS) for _ in range(8))


async def game_id_generator(*, batch, check_collision=False):

    ids = {id8() for _ in range(batch)}
    if check_collision:
        ids_collision_db = await get_collision_ids(ids)
        return ids - ids_collision_db
    return ids


@database_sync_to_async
def get_collision_ids(ids):
    return set(Game.objects.filter(game_id__in=ids).values_list("game_id", flat=True))
