import redis
import random
import string
from raviolichess.redis_client import sync_redis_client as r
from .models import Game

ID_CHARS = string.ascii_letters + string.digits


def id8():
    return "".join(random.choice(ID_CHARS) for _ in range(8))


def batch(size=256):
    ids = {id8() for _ in range(size)}
    reserved = set(
        Game.objects.filter(game_id__in=ids).values_list("game_id", flat=True)
    )
    return ids - reserved


def get_id():

    id = r.spop(f"ids:pool")
    if not id:
        try:
            with r.lock("fill_ids", blocking=False) as lock:
                ids = batch()
                with r.pipeline() as pipe:
                    pipe.sadd("ids:pool", *ids)
                    pipe.spop("ids:pool")
                    _, id = pipe.execute()
        except redis.exceptions.LockError:
            id = id8()

    return id
