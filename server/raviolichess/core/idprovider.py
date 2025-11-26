import string
import random
import asyncio
from functools import cached_property
from channels.db import database_sync_to_async
from redis.exceptions import LockError, RedisError
from raviolichess.ipc.channels import Channel
from raviolichess.game.models import Game
from .background import BackgroundSubscriber


class SequencerMixin:
    """get item one by one and generate them in batch"""

    async def one(self):
        async with self._lock:
            item = await self._get()
            if not item:
                item = await self._generate()
            return item


class ChanId(Channel):

    def __init__(self, name):
        self.name = name

    @cached_property
    def chan(self) -> str:
        return f"{self.prefix}:{self.__class__.__qualname__.lower()}:{self.name}"


class AsyncIdProvider(SequencerMixin, BackgroundSubscriber[ChanId]):
    """Provide id pulled from a cache backend.
    Use pubsub to synchronise processes"""

    def __init__(self, *, name, layer, generator, batch: int = 512):
        self.name: str = name
        self._layer = layer
        self._skey = f"ids:{name}"
        self._batch = batch
        self._generator = generator
        self._lock = asyncio.Lock()
        self._event = asyncio.Event()

    @cached_property
    def channel(self):
        return ChanId(self.name)

    async def _get(self):
        item = await self._layer.spop(self._skey)
        return item.decode() if item else None

    async def _generate(self):
        while True:
            try:
                async with self._layer.lock(
                    f"generate-{self._skey}", blocking=False, timeout=2
                ):
                    # double-check to prevent stale assumption
                    item = await self._get()
                    if not item:
                        ids = await self._generator(batch=self._batch)
                        async with self._layer.pipeline() as pipe:
                            await pipe.sadd(self._skey, *ids)
                            await pipe.spop(self._skey)
                            await pipe.publish(self.channel.chan, "")
                            (
                                _,
                                item,
                                _,
                            ) = await pipe.execute()
                    return item.decode()

            except LockError:
                try:
                    await asyncio.wait_for(self._event.wait(), timeout=2.1)
                    return await self._get()
                except asyncio.TimeoutError:
                    continue

            except RedisError:
                raise

    async def on_message(self, _):
        """called by Notifier when another process publish to related chan"""
        self._event.set()
        self._event.clear()


# GAME ID
ID_CHARS = string.ascii_letters + string.digits


def id8():
    return "".join(random.choice(ID_CHARS) for _ in range(8))


@database_sync_to_async
def get_collision_ids(ids):
    return set(Game.objects.filter(game_id__in=ids).values_list("game_id", flat=True))


async def game_id_generator(*, batch):

    ids = {id8() for _ in range(batch)}
    ids_collision_db = await get_collision_ids(ids)
    return ids - ids_collision_db
