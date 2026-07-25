from logging import config

from pydantic_settings import BaseSettings, SettingsConfigDict


class LogConfig(BaseSettings):
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


def configure_logging(conf: LogConfig):
    config.dictConfig(conf.get_logging_config)
