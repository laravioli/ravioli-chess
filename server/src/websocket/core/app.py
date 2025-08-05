from raviolichess.layers import get_redis_layer
from .notifiers import Notifier
from .idprovider import AsyncIdProvider
from .idgenerator import game_id_generator

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from redis.asyncio import Redis as AsyncRedis


class App:
    def __init__(
        self,
        *,
        layer: AsyncRedis,
        notifier: Notifier,
        id_providers=dict[str, AsyncIdProvider]
    ):
        self.layer = layer
        self.notifier = notifier
        self.id_providers = id_providers

    def start(self):
        subscribers = {}
        for id_provider in self.id_providers.values():
            subscribers[id_provider.channel] = id_provider.handler
        self.notifier.subscribe(subscribers)
        self.notifier.start()

    async def shutdown(self):
        await self.notifier.stop()
        await self.layer.aclose()


async def start_app():
    layer = get_redis_layer("async")
    notifier = Notifier(layer=layer)
    game_id_provider = AsyncIdProvider(
        name="game", generator=game_id_generator, layer=layer
    )
    id_providers = {"game": game_id_provider}

    app = App(layer=layer, notifier=notifier, id_providers=id_providers)
    app.start()

    return app
