import redis


class AsyncProcessNotifier:
    """Class used has a background task, wich listen from external events and execute handlers"""

    def __init__(self, *, layer: redis.Redis, channels: dict):
        self._pubsub = layer.pubsub()
        self._channels = channels

    async def run(self):
        p = self._pubsub
        await p.subscribe(**self._channels)
        async for _ in p.listen():
            pass

    async def aclose(self):
        await self._pubsub.aclose()
