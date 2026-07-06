from typing import Annotated

from fastapi import BackgroundTasks, Depends
from fastapi.requests import HTTPConnection
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncSession

from .background import Background
from .env import Env


async def get_env(http_conn: HTTPConnection) -> Env:
    return http_conn.state["env"]


type EnvDep = Annotated[Env, Depends(get_env)]


async def get_connection(http_conn: HTTPConnection):
    env: Env = http_conn.state["env"]
    async with env.core.engine.connect() as db_conn:
        yield db_conn


type DbConnection = Annotated[AsyncConnection, Depends(get_connection, scope="function")]


async def get_session(http_conn: HTTPConnection):
    env: Env = http_conn.state["env"]
    async with env.core.session_maker() as session:
        yield session


type DbSession = Annotated[AsyncSession, Depends(get_session, scope="function")]


# ╔══════════════════════════════════════╗
# ║   BACKGROUND                         ║
# ╚══════════════════════════════════════╝


async def get_background(http_conn: HTTPConnection, background_tasks: BackgroundTasks):
    env: Env = http_conn.state["env"]
    return Background(env.core.pub, env.core.session_maker, background_tasks)


type BackgroundDep = Annotated[Background, Depends(get_background)]
