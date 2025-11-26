from __future__ import annotations
from redis.asyncio import Redis
from channels.layers import get_channel_layer
from raviolichess.ipc.layer import get_layer
from .background import Background
from .idprovider import AsyncIdProvider, game_id_generator
from .game import GameDB, GameQueue, GameManager
from .pubsub import PubSubManager
from typing import TypedDict


class App:
    def __init__(self, *, layer: Redis, services: Services, managers: Managers):
        self.layer = layer
        self.services = services
        self.managers = managers

    def start(self):
        Background.register(self.services["game_id"])
        Background.register(self.services["game_queue"])
        self.managers["pubsub"].start()
        self.managers["game"].start(
            subscribe=self.managers["pubsub"].subscribe,
            unsubscribe=self.managers["pubsub"].unsubscribe,
        )

    async def shutdown(self):
        await self.managers["game"].stop()
        await self.managers["pubsub"].stop()
        await self.layer.aclose()
        await get_channel_layer().flush()


async def start_app():
    layer = get_layer()
    services = create_services(layer)
    managers = create_managers(layer, services)
    app = App(layer=layer, services=services, managers=managers)
    app.start()

    return app


class Services(TypedDict):
    game_id: AsyncIdProvider
    game_queue: GameQueue


class Managers(TypedDict):
    game: GameManager
    pubsub: PubSubManager


def create_services(layer) -> Services:
    game_id = AsyncIdProvider(name="game", layer=layer, generator=game_id_generator)
    game_queue = GameQueue(1)

    return {
        "game_id": game_id,
        "game_queue": game_queue,
    }


def create_managers(layer, services) -> Managers:
    game_manager = GameManager(services["game_queue"], GameDB(services["game_id"]))
    pubsub_manager = PubSubManager(layer=layer)
    return {"game": game_manager, "pubsub": pubsub_manager}
