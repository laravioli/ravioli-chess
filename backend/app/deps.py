from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import BackgroundTasks, Depends
from fastapi.requests import HTTPConnection
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncSession

from .background import Background
from .env import Env, UserRepo


async def get_env(http_conn: HTTPConnection) -> Env:
    return http_conn.state["env"]


type EnvDep = Annotated[Env, Depends(get_env)]


async def get_user_repo(env: EnvDep):
    return env.user.user_repo


type UserRepoDep = Annotated[UserRepo, Depends(get_user_repo)]

# ╔══════════════════════════════════════╗
# ║   COMMUNICATION                      ║
# ╚══════════════════════════════════════╝


async def get_connection(http_conn: HTTPConnection) -> AsyncGenerator[AsyncConnection]:

    async with http_conn.state["env"].core.engine.connect() as db_conn:
        yield db_conn


type DbConnection = Annotated[AsyncConnection, Depends(get_connection, scope="function")]


async def get_session(db_conn: DbConnection) -> AsyncGenerator[AsyncSession]:

    async with AsyncSession(bind=db_conn) as session:
        yield session


type DbSession = Annotated[AsyncSession, Depends(get_session, scope="function")]


async def get_redis(http_conn: HTTPConnection) -> Redis:
    return http_conn.state["env"].core.redis


type RedisDep = Annotated[Redis, Depends(get_redis)]


# ╔══════════════════════════════════════╗
# ║   BACKGROUND                         ║
# ╚══════════════════════════════════════╝


async def get_background(http_conn: HTTPConnection, background_tasks: BackgroundTasks):
    env: Env = http_conn.state["env"]
    return Background(env.core.pub, env.core.session_maker, background_tasks)


type BackgroundDep = Annotated[Background, Depends(get_background)]
