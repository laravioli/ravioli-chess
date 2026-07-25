from __future__ import annotations

from contextlib import AbstractAsyncContextManager

from ravioli_core.ipc.channels import EngChan
from ravioli_core.ipc.redis import RedisConfig, create_async_redis
from ravioli_core.pubsub import Connection

from .game import Games
from .pubsub import Listener, Publisher, make_handler


class App(AbstractAsyncContextManager):
    def __init__(self):
        self.redis = create_async_redis(config=RedisConfig())  # type: ignore
        self.pub = Publisher(self.redis)
        self.games = Games(self.pub)
        self.listener = Listener(Connection(EngChan.all, self.redis))

    async def __aenter__(self):
        self.pub.start()
        self.listener.start(make_handler(self.games))
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self.listener.stop()
        await self.games.stop()
        await self.pub.stop()
        await self.redis.aclose()
