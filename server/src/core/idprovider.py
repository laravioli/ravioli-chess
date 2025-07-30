import asyncio
import random
import string
from redis.exceptions import LockError


class MixinRessourceSequencer:
    """get item one by one and generate them in batch"""

    async def one(self):
        async with self._lock:
            item = await self._get()
            if not item:
                item = await self._generate(batch=self.batch)
            return item


class AsyncIdProvider(MixinRessourceSequencer):
    """Provide id pulled from an external source"""

    from raviolichess.layers import async_layer

    __layer__ = async_layer

    def __init__(self, *, name: str, generator, batch: int = 256):
        self.channel = f"channel-ids-{name}"
        self._key = f"ids:{name}"
        self._lock = asyncio.Lock()
        self._event = asyncio.Event()
        self._generator = generator
        self.batch = batch

    async def _get(self):
        return await AsyncIdProvider.__layer__.spop(self._key)

    async def _generate(self, batch):
        while True:
            try:
                async with AsyncIdProvider.__layer__.lock(
                    f"generate-{self._key}", blocking=False, timeout=2
                ):
                    ids = await self._generator(AsyncIdProvider.__layer__, batch=batch)
                    async with AsyncIdProvider.__layer__.pipeline() as pipe:
                        await pipe.sadd(self._key, *ids)
                        await pipe.spop(self._key)
                        await pipe.publish(self.channel, "")
                        (
                            _,
                            item,
                            _,
                        ) = await pipe.execute()
                        return item

            except LockError:
                await asyncio.wait_for(self._event.wait(), timeout=2.1)
                return await AsyncIdProvider.__layer__.spop(self._key)

            except TimeoutError:
                continue

    async def notify(self, _):
        self._event.set()
        self._event.clear()


# GENERATOR
ID_CHARS = string.ascii_letters + string.digits


def id8():
    return "".join(random.choice(ID_CHARS) for x in range(8))


async def id_generator(layer, *, batch):

    ids_gen = {id8() for _ in range(batch)}
    ids_db = await layer.smembers("ids:db")
    return ids_gen - ids_db


# INSTANCE

id_provider = AsyncIdProvider(name="game", generator=id_generator, batch=256)
notifier = Notifier(channels={id_provider.channel: id_provider.notify})

from raviolichess.layers import async_layer


# Client


async def create_db_object(retry=3):

    lua_script = """
    if redis.call('SISMEMBER', KEYS[1], ARGV[1]) == 0 then
        redis.call('SADD', KEYS[1], ARGV[1])
        return redis.call('SCARD', KEYS[1])
    else
        return -1
    end
    """
    for _ in range(retry):
        id = await id_provider.one()
        result = await async_layer.eval(lua_script, 1, "ids:db", id)
        if result >= 0:
            # print(f"inserted {result} element in db")
            return

    raise Exception("collision")


async def a_greedy_consumer(nb):
    for _ in range(nb):
        await create_db_object()


def main():
    import time

    start = time.perf_counter()

    async def letsgo(nb=50):
        reader = asyncio.create_task(notifier.run())
        tasks = []
        for _ in range(nb):
            task = asyncio.create_task(a_greedy_consumer(100))
            tasks.append(task)

        await asyncio.gather(*tasks)
        end = time.perf_counter()
        print("PERF: ", end - start)
        await reader

    asyncio.run(letsgo())
