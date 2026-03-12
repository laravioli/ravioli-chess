from __future__ import annotations

from contextlib import AbstractAsyncContextManager

from redis.asyncio import Redis

from core.pubsub import Broadcast, RedisBackend

from .config import settings
from .game.manager import GameManager


class App(AbstractAsyncContextManager):
    def __init__(self, pid: int):
        self.pid = pid
        self.redis = Redis.from_url(settings.REDIS_URL, health_check_interval=15)
        self.broadcast = Broadcast(backend=RedisBackend(self.redis))
        self.game_manager = GameManager()

    async def __aenter__(self):
        await self.broadcast.start()
        return self

    async def __aexit__(self):
        await self.game_manager.stop()
