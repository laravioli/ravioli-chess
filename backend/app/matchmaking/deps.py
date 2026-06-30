from typing import Annotated

from fastapi import BackgroundTasks, Depends
from fastapi.requests import HTTPConnection
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.background import Background
from app.publisher import Publisher

from .env import Env
from .service import MatchMakingService


async def get_env(conn: HTTPConnection) -> Env:
    return conn.state["env"]


type EnvDep = Annotated[Env, Depends(get_env)]


async def get_mm(env: EnvDep):
    return env.matchmaking


type MatchmakingServiceDep = Annotated[MatchMakingService, Depends(get_mm)]


# ╔══════════════════════════════════════╗
# ║   DATABASE                           ║
# ╚══════════════════════════════════════╝


async def get_engine(env: EnvDep):
    return env.engine


type EngineDep = Annotated[AsyncEngine, Depends(get_engine)]


async def get_session(env: EnvDep):
    async with env.session_maker() as session:
        yield session


type DbSession = Annotated[AsyncSession, Depends(get_session, scope="function")]


# ╔══════════════════════════════════════╗
# ║   REDIS                              ║
# ╚══════════════════════════════════════╝


async def get_redis(env: EnvDep):
    return env.redis


type RedisClient = Annotated[Redis, Depends(get_redis)]


# ╔══════════════════════════════════════╗
# ║   PUBLISHER                          ║
# ╚══════════════════════════════════════╝


async def get_publisher(env: EnvDep):
    return env.pub


type PublisherDep = Annotated[Publisher, Depends(get_publisher)]


# ╔══════════════════════════════════════╗
# ║   BACKGROUND                         ║
# ╚══════════════════════════════════════╝


async def get_background(env: EnvDep, background_tasks: BackgroundTasks):
    return Background(env.pub, env.session_maker, background_tasks)


type BackgroundDep = Annotated[Background, Depends(get_background)]
