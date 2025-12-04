from __future__ import annotations
from channels.layers import get_channel_layer
from raviolichess.ipc.layer import get_layer
from .background import BackgroundRegistry
from .idprovider import AsyncIdProvider, game_id_generator
from .manager import ManagerRegistry
from .pubsub import PubSubManager
from .game import GameManager, GameDB, GameQueue


class App:

    def __init__(self, pid: int):
        self.pid = pid
        self.layer = get_layer()
        self.backgrounds = BackgroundRegistry()
        self.managers = ManagerRegistry()

    def start(self):
        self.wire()
        self.managers.start()

    def wire(self):
        self.backgrounds.register(
            "game_id",
            AsyncIdProvider(name="game", layer=self.layer, generator=game_id_generator),
        )
        self.backgrounds.register("game_queue", GameQueue(self.pid))
        self.managers.register(
            "pubsub",
            PubSubManager(
                layer=self.layer,
                subscriptions=self.backgrounds.get_subscriptions(),
            ),
        )
        self.managers.register(
            "game",
            GameManager(
                game_queue=self.backgrounds.get("game_queue"),
                game_db=GameDB(self.backgrounds.get("game_id")),
                subscribe=self.managers.get("pubsub").subscribe,
                unsubscribe=self.managers.get("pubsub").unsubscribe,
            ),
        )

    async def shutdown(self):
        await self.managers.stop()
        await get_layer().aclose()
        await get_channel_layer().flush()


async def start_app(pid):
    app = App(pid)
    app.start()

    return app
