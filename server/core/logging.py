from logging import config

from pydantic_settings import BaseSettings, SettingsConfigDict


class LogSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", env_ignore_empty=True)

    LOG_LEVEL: str = "DEBUG"
    LOG_FORMAT: str = "%(asctime)s | %(name)s | %(levelname)-6s | %(message)s"

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
                "uvicorn.access": {"level": "INFO", "propagate": False},
            },
        }


def configure_logging(settings: LogSettings):
    config.dictConfig(settings.get_logging_config)
