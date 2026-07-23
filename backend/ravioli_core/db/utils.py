from contextlib import asynccontextmanager

import asyncpg
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from ravioli_core.config import DbSettings


def create_engine(s: DbSettings):
    engine = create_async_engine(
        str(s.SQLALCHEMY_DATABASE_URI),
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=False,
        pool_recycle=1800,  # avoid stale sockets
        future=True,
        connect_args={"server_settings": {"jit": "off"}},
    )
    return engine


def create_sessionmaker(engine: AsyncEngine):
    return async_sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


@asynccontextmanager
async def transaction(conn: AsyncConnection | AsyncSession, error_detail="Integrity Error"):
    try:
        yield
        await conn.commit()
    except BaseException as e:
        if isinstance(e, IntegrityError):
            setattr(e, "detail", error_detail)
        await conn.rollback()
        raise


async def init_db_pool(
    dsn: str = "postgresql://postgres:postgres@localhost:5432/app", max_size: int = 30
):
    return await asyncpg.create_pool(dsn=dsn, max_size=max_size)
