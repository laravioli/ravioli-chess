from typing import Annotated

from asyncpg import Connection
from fastapi import BackgroundTasks, Depends
from fastapi.requests import HTTPConnection
from redis.asyncio import Redis

from .background import Background
from .env import Env, UserRepo


async def get_env(http_conn: HTTPConnection) -> Env:
    return http_conn.state["env"]


type EnvDep = Annotated[Env, Depends(get_env)]


async def get_user_repo(env: EnvDep):
    return env.user.repo


type UserRepoDep = Annotated[UserRepo, Depends(get_user_repo)]


# ╔══════════════════════════════════════╗
# ║   COMMUNICATION                      ║
# ╚══════════════════════════════════════╝


async def get_pool_connection(env: EnvDep):

    async with env.core.pg_pool.acquire() as conn:
        yield conn


type PoolConnection = Annotated[Connection, Depends(get_pool_connection, scope="function")]


async def get_redis(env: EnvDep) -> Redis:
    return env.core.redis


type RedisDep = Annotated[Redis, Depends(get_redis)]


# ╔══════════════════════════════════════╗
# ║   BACKGROUND                         ║
# ╚══════════════════════════════════════╝


async def get_background(http_conn: HTTPConnection, background_tasks: BackgroundTasks):
    env: Env = http_conn.state["env"]
    return Background(env.core.pub, background_tasks)


type BackgroundDep = Annotated[Background, Depends(get_background)]
