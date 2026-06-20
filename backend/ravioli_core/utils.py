from collections.abc import Coroutine
from contextlib import asynccontextmanager

# DB stuff
from typing import Any, Protocol

from redis.asyncio import Redis
from sqlalchemy.exc import IntegrityError
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


class Transactional(Protocol):
    def commit(self) -> Coroutine[Any, Any, None]: ...
    def rollback(self) -> Coroutine[Any, Any, None]: ...


@asynccontextmanager
async def transaction(conn: Transactional, error_detail="Integrity Error"):
    try:
        yield
        await conn.commit()
    except BaseException as e:
        if isinstance(e, IntegrityError):
            e.detail = error_detail
        await conn.rollback()
        raise


def create_async_redis(**kwargs: Any):
    settings = RedisSettings().as_dict()
    settings.update(kwargs)
    return Redis(**settings)
