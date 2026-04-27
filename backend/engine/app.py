from __future__ import annotations

from contextlib import AbstractAsyncContextManager

from ravioli_core.config import RedisSettings
from ravioli_core.pubsub import Broadcast, RedisBackend
from ravioli_core.utils import create_async_redis

from .game.manager import GameManager


class App(AbstractAsyncContextManager):
    def __init__(self, pid: int):
        self.pid = pid
        self.redis = create_async_redis(settings=RedisSettings())
        self.broadcast = Broadcast(backend=RedisBackend(self.redis))
        self.game_manager = GameManager(broadcast=self.broadcast)

    async def __aenter__(self):
        await self.broadcast.start()
        await self.game_manager.start()

        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self.broadcast.stop()
        await self.game_manager.stop()
        await self.redis.aclose()
