from raviolichess.layers import get_redis_layer
from channels.layers import get_channel_layer
from .pubsub import BackgroundListener, BackgroundRegistry
from .idprovider import AsyncIdProvider
from .idgenerator import game_id_generator
from redis.asyncio import Redis as AsyncRedis


class App:
    def __init__(
        self,
        *,
        layer: AsyncRedis,
        listener: BackgroundListener,
        services: dict[str, any]
    ):
        self.layer = layer
        self.listener = listener
        self.services = services

    def start(self):
        BackgroundRegistry.register(self.services.get("game_id"))
        self.listener.start()

    async def shutdown(self):
        await self.listener.stop()
        await self.layer.aclose()
        await get_channel_layer().close_pools()


async def start_app():
    layer = get_redis_layer("async")
    services = {
        "game_id": AsyncIdProvider(
            name="game", layer=layer, generator=game_id_generator
        )
    }

    listener = BackgroundListener(layer=layer)

    app = App(layer=layer, listener=listener, services=services)
    app.start()

    return app
