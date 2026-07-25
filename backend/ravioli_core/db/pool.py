import asyncpg
from pydantic_settings import BaseSettings, SettingsConfigDict


class PoolConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="POSTGRES_", env_file=".env", extra="ignore", env_ignore_empty=True
    )

    USER: str
    PASSWORD: str = ""
    HOST: str
    PORT: int = 5432
    DB: str = ""

    @property
    def dsn(self):
        return f"postgres://{self.USER}:{self.PASSWORD}@{self.HOST}:{self.PORT}/{self.DB}"


async def create_db_pool(config: PoolConfig):
    return await asyncpg.create_pool(dsn=config.dsn, max_size=20)
