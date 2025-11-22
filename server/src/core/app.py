from ipc.layer import get_layer
from channels.layers import get_channel_layer
from .background import Background
from .idprovider import AsyncIdProvider
from .idgenerator import game_id_generator
from .game import GameProvider, GameManager
from .pubsub import ChannelManager
from redis.asyncio import Redis


class App:
    def __init__(
        self, *, layer: Redis, services: dict[str, any], managers: dict[str, any]
    ):
        self.layer = layer
        self.services = services
        self.managers = managers

    def start(self):
        Background.register(self.services["game_id"])
        Background.register(self.services["game_provider"])
        self.managers["channel"].start()
        self.managers["game"].start()

    async def shutdown(self):
        await self.managers["game"].stop()
        await self.managers["channel"].stop()
        await self.layer.aclose()
        await get_channel_layer().close_pools()


async def start_app():
    layer = get_layer("redis")
    services = create_services(layer)
    managers = create_managers(layer, services)
    app = App(layer=layer, services=services, managers=managers)
    app.start()

    return app


def create_services(layer):
    game_id_provider = AsyncIdProvider(
        name="game", layer=layer, generator=game_id_generator
    )
    game_provider = GameProvider(game_id_provider)

    return {
        "game_id": game_id_provider,
        "game_provider": game_provider,
    }


def create_managers(layer, services):
    game_manager = GameManager(services["game_provider"])
    channel_manager = ChannelManager(layer=layer)
    return {"game": game_manager, "channel": channel_manager}
