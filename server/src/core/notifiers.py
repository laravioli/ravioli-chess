class Notifier:
    """Background notifier for process communication"""

    from raviolichess.layers import async_layer

    __layer__ = async_layer

    def __init__(self, *, channels: dict):
        self._pubsub = Notifier.__layer__.pubsub()
        self._channels = channels

    async def run(self):
        p = self._pubsub
        await p.subscribe(**self._channels)
        async for _ in p.listen():
            pass

    async def aclose(self):
        await self._pubsub.aclose()
