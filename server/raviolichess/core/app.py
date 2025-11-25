from __future__ import annotations
from ipc.layer import get_layer
from channels.layers import get_channel_layer
from .background import Background
from .idprovider import AsyncIdProvider
from .idgenerator import game_id_generator
from .game import GameDB, GameQueue, GameManager
from .pubsub import ChannelManager
from redis.asyncio import Redis
from typing import TypedDict


class App:
    def __init__(self, *, layer: Redis, services: Services, managers: Managers):
        self.layer = layer
        self.services = services
        self.managers = managers

    def start(self):
        Background.register(self.services["game_id"])
        Background.register(self.services["game_queue"])
        self.managers["channel"].start()
        self.managers["game"].start(
            subscribe=self.managers["channel"].subscribe,
            unsubscribe=self.managers["channel"].unsubscribe,
        )

    async def shutdown(self):
        await self.managers["game"].stop()
        await self.managers["channel"].stop()
        await self.layer.aclose()
        await get_channel_layer().flush()


async def start_app():
    layer = get_layer("redis")
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
    channel: ChannelManager


def create_services(layer) -> Services:
    game_id = AsyncIdProvider(name="game", layer=layer, generator=game_id_generator)
    game_queue = GameQueue(1)

    return {
        "game_id": game_id,
        "game_queue": game_queue,
    }


def create_managers(layer, services) -> Managers:
    game_manager = GameManager(services["game_queue"], GameDB(services["game_id"]))
    channel_manager = ChannelManager(layer=layer)
    return {"game": game_manager, "channel": channel_manager}
