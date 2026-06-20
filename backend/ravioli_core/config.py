from logging import config

from pydantic import PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict
from redis.asyncio.retry import Retry
from redis.backoff import ExponentialWithJitterBackoff


class DbSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", env_ignore_empty=True)

    POSTGRES_HOST: str
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""

    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_HOST,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )


class RedisSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", env_ignore_empty=True)

    REDIS_HOST: str
    REDIS_PORT: str
    REDIS_UNIX_SOCKET_PATH: str | None = None

    def as_dict(self):
        return {
            "host": self.REDIS_HOST,
            "port": self.REDIS_PORT,
            "socket_connect_timeout": 15,
            "socket_timeout": 5,
            "unix_socket_path": self.REDIS_UNIX_SOCKET_PATH,
            "decode_responses": False,
            "retry": Retry(backoff=ExponentialWithJitterBackoff(base=1, cap=10), retries=3),
            "health_check_interval": 3,
            "protocol": 3,
        }


class LogSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", env_ignore_empty=True)

    LOG_LEVEL: str = "INFO"
    SQL_LOG_LEVEL: str = "WARNING"
    LOG_FORMAT: str = "%(levelname)-6s | %(message)s"

    @property
    def get_logging_config(self):
        return {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "standard": {
                    "format": self.LOG_FORMAT,
                    "datefmt": "%H:%M:%S",
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "standard",
                    "stream": "ext://sys.stdout",
                },
            },
            "loggers": {
                "": {
                    "handlers": ["console"],
                    "level": self.LOG_LEVEL,
                },
                "sqlalchemy.engine": {
                    "handlers": ["console"],
                    "level": self.SQL_LOG_LEVEL,
                    "propagate": False,
                },
            },
        }


def configure_logging(settings: LogSettings):
    config.dictConfig(settings.get_logging_config)
