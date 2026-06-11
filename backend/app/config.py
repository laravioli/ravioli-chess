import os
import secrets
from typing import Annotated, Literal

from pydantic import SecretStr, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", env_ignore_empty=True)

    NODE_ID: str = f"node:{os.getpid()}"
    ENVIRONMENT: Literal["local", "staging", "production"] = "production"
    SECRET_KEY: SecretStr = secrets.token_urlsafe(32)
    SSL: bool = True
    ALLOWED_HOSTS: Annotated[list[str], NoDecode]

    ANON_COOKIE: str = "anon"
    SESSION_COOKIE: str = "session"

    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def decode_hosts(cls, v: str) -> list[str]:
        return [str(s) for s in v.split(",") if s]


settings = Settings()
