import secrets
from typing import Literal

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", env_ignore_empty=True)

    ENVIRONMENT: Literal["local", "staging", "production"] = "production"
    SECRET_KEY: SecretStr = secrets.token_urlsafe(32)
    SSL: bool = True

    ANON_COOKIE: str = "anon"
    SESSION_COOKIE: str = "session"

    REDIS_URL: str


settings = Settings()
