from piccolo.conf.apps import AppRegistry
from piccolo.engine.postgres import PostgresEngine
from pydantic_settings import BaseSettings, SettingsConfigDict


class DbSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="POSTGRES_",
        env_file=".env",
        extra="ignore",
        env_ignore_empty=True,
    )
    HOST: str
    PORT: int = 5432
    USER: str
    PASSWORD: str = ""


db_settings = DbSettings()  # type: ignore

DB = PostgresEngine(
    config={
        "host": db_settings.HOST,
        "port": db_settings.PORT,
        "user": db_settings.USER,
        "password": db_settings.PASSWORD,
        "database": "rav",
    }
)
APP_REGISTRY = AppRegistry(apps=["ravioli_core.db1.piccolo_app"])
