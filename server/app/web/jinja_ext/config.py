from typing import Annotated, Literal, Self

from pydantic import AfterValidator, FilePath, ValidationError, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def slash_str(value: str) -> str:
    if not (value.startswith("/") and value.endswith("/")):
        raise ValidationError(f'{value} must start and end with " / "')
    return value


type SlashStr = Annotated[str, AfterValidator(slash_str)]


class JinjaConfig(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", env_ignore_empty=True)

    ENVIRONMENT: Literal["local", "staging", "production"] = "production"
    STATIC_BASE_URL: SlashStr = "/static/"
    MANIFEST_PATH: FilePath | None = None
    LEGACY_POLYFILLS_MOTIF: str = "legacy-polyfills"
    WS_CLIENT_URL: str = "@vite/client"
    REACT_REFRESH_URL: str = "@react-refresh"
    JINJA_CACHE_EXTENSION: bool = False

    @model_validator(mode="after")
    def check_manifest_path(self) -> Self:
        if self.ENVIRONMENT == "production" and self.MANIFEST_PATH is None:
            raise ValidationError("MANIFEST_PATH must be set in production")
        return self
