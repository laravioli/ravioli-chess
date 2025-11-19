from ipc.layer import get_layer
from channels.layers import get_channel_layer
from .background import BackgroundRegistry
from .pubsub import ChannelManager
from .idprovider import AsyncIdProvider
from .idgenerator import game_id_generator
from redis.asyncio import Redis


class App:
    def __init__(
        self, *, layer: Redis, channel_manager: ChannelManager, services: dict[str, any]
    ):
        self.layer = layer
        self.channel_manager = channel_manager
        self.services = services

    def start(self):
        BackgroundRegistry.register(self.services.get("game_id"))
        self.channel_manager.start()

    async def shutdown(self):
        await self.channel_manager.stop()
        await self.layer.aclose()
        await get_channel_layer().close_pools()


async def start_app():
    layer = get_layer("redis")
    services = {
        "game_id": AsyncIdProvider(
            name="game", layer=layer, generator=game_id_generator
        )
    }
    app = App(
        layer=layer, channel_manager=ChannelManager(layer=layer), services=services
    )
    app.start()

    return app
