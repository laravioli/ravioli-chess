from typing import Any

from pydantic_settings import BaseSettings, SettingsConfigDict
from redis.asyncio import Redis
from redis.asyncio.retry import Retry
from redis.backoff import ExponentialWithJitterBackoff


class RedisConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="REDIS_", env_file=".env", extra="ignore", env_ignore_empty=True
    )

    HOST: str
    PORT: str
    UNIX_SOCKET_PATH: str | None = None

    def as_dict(self):
        return {
            "host": self.HOST,
            "port": self.PORT,
            "socket_connect_timeout": 15,
            "socket_timeout": 5,
            "unix_socket_path": self.UNIX_SOCKET_PATH,
            "decode_responses": False,
            "retry": Retry(backoff=ExponentialWithJitterBackoff(base=1, cap=10), retries=3),
            "health_check_interval": 3,
            "protocol": 3,
        }


def create_async_redis(config: RedisConfig, **overrides: Any):
    settings_dict = config.as_dict()  # type: ignore
    settings_dict.update(**overrides)
    return Redis(**settings_dict)
