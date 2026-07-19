from logging import config

import colorama
from pydantic import PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict
from redis.asyncio.retry import Retry
from redis.backoff import ExponentialWithJitterBackoff


class DbSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="POSTGRES_", env_file=".env", extra="ignore", env_ignore_empty=True
    )

    HOST: str
    PORT: int = 5432
    USER: str
    PASSWORD: str = ""
    DB: str = ""

    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=self.USER,
            password=self.PASSWORD,
            host=self.HOST,
            port=self.PORT,
            path=self.DB,
        )


class RedisSettings(BaseSettings):
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
                "default": {
                    "()": "uvicorn.logging.DefaultFormatter",
                    "fmt": "%(levelprefix)s %(message)s",
                    "use_colors": True,
                },
                "access": {
                    "()": "uvicorn.logging.AccessFormatter",
                    "fmt": '%(levelprefix)s %(client_addr)s - "%(request_line)s" %(status_code)s',
                    "use_colors": True,
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "standard",
                    "stream": "ext://sys.stdout",
                },
                "default": {
                    "formatter": "default",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stderr",
                },
                "access": {
                    "formatter": "access",
                    "class": "logging.StreamHandler",
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
                "uvicorn": {"handlers": ["default"], "level": self.LOG_LEVEL, "propagate": False},
                "uvicorn.error": {"level": "INFO"},
                "uvicorn.access": {
                    "handlers": ["access"],
                    "level": self.LOG_LEVEL,
                    "propagate": False,
                },
            },
        }


def configure_logging(settings: LogSettings):
    colorama.deinit()
    config.dictConfig(settings.get_logging_config)
