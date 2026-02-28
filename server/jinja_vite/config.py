from typing import Annotated, Literal, Self

from pydantic import AfterValidator, FilePath, ValidationError, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def trailing_slash(value: str) -> str:
    if not value.endswith("/"):
        raise ValidationError(f'{value} must end with " / "')
    return value


type TrailingSlashStr = Annotated[str, AfterValidator(trailing_slash)]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", env_ignore_empty=True)

    ENVIRONMENT: Literal["local", "staging", "production"] = "production"
    DEV_SERVER_PROTOCOL: Literal["http", "https"] = "http"
    DEV_SERVER_HOST: str = "localhost"
    DEV_SERVER_PORT: int = 5173
    STATIC_URL: TrailingSlashStr = "static/"
    URL_SCOPE_PREFIX: TrailingSlashStr | Literal[""] = ""
    MANIFEST_PATH: FilePath | None = None
    LEGACY_POLYFILLS_MOTIF: str = "legacy-polyfills"
    WS_CLIENT_URL: str = "@vite/client"
    REACT_REFRESH_URL: str = "@react-refresh"

    @model_validator(mode="after")
    def check_manifest_path(self) -> Self:
        if self.ENVIRONMENT == "production" and self.MANIFEST_PATH is None:
            raise ValidationError("MANIFEST_PATH must be set in production")
        return self


settings = Settings()
