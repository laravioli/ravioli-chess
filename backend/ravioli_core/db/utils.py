from collections.abc import Coroutine
from contextlib import asynccontextmanager

# DB stuff
from typing import Any, Protocol

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine

from ravioli_core.config import DbSettings


def create_engine(s: DbSettings):
    engine = create_async_engine(
        str(s.SQLALCHEMY_DATABASE_URI),
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=False,
        pool_recycle=1800,  # avoid stale sockets
        future=True,
        connect_args={"server_settings": {"jit": "off"}},
    )
    return engine


def create_sessionmaker(engine: AsyncEngine):
    return async_sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


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
            setattr(e, "detail", error_detail)
        await conn.rollback()
        raise
