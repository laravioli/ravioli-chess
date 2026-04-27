from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from .config import DbSettings, RedisSettings


def create_engine_and_sessionmaker(settings: DbSettings):
    engine = create_async_engine(
        str(settings.SQLALCHEMY_DATABASE_URI),
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,  # validates connections before use
        pool_recycle=1800,  # avoid stale sockets
        future=True,
    )
    return engine, async_sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def create_async_redis(settings: RedisSettings):
    return Redis.from_url(settings.REDIS_URL, health_check_interval=15)
