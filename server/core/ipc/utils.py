from redis.asyncio import Redis

from .config import IpcSettings


def create_async_redis(settings: IpcSettings):
    return Redis.from_url(settings.REDIS_URL, health_check_interval=15)
