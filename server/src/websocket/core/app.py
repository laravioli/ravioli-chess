from raviolichess.layers import get_redis_layer
from channels.layers import get_channel_layer
from .pubsub import BackgroundListener
from .idprovider import AsyncIdProvider
from .idgenerator import game_id_generator
from redis.asyncio import Redis as AsyncRedis


# todo:0) read more about redis safety (reuse of connection bewteen coroutine, connection pool etc), finish read receive channel-redis impl with this in mind
#   -> 1) rewrite the App layer (better relation between object, and avoid new Game(object) beter newgame() partial or watever)
#               -> write an ABC to make explicit wich class need PUBSUB(a channel + an handler -> then subscribers isinstance(...))
#      2) read about redis persistance (specially docker) and add it
#      3) add django cache
#      4) configure session with cache
#      5) write your first cache with opening position
#      6) improve the ctx/data routing mechanism
#      7) start websocket (separate websocket game/general or find solution (even for login/anonymous))
class App:
    def __init__(
        self,
        *,
        layer: AsyncRedis,
        listener: BackgroundListener,
        services=dict[str, any]
    ):
        self.layer = layer
        self.listener = listener
        self.services = services

    def start(self):
        subscribers = {}
        for service in self.services.values():
            subscribers[service.channel] = service.handler
        self.listener.subscribe(subscribers)
        self.listener.start()

    async def shutdown(self):
        await self.listener.stop()
        await self.layer.aclose()
        await get_channel_layer().close_pools()


async def start_app():
    layer = get_redis_layer("async")
    listener = BackgroundListener(layer=layer)
    services = {
        "game_id": AsyncIdProvider(
            name="game", generator=game_id_generator, layer=layer
        )
    }

    app = App(layer=layer, listener=listener, services=services)
    app.start()

    return app
