from typing import Annotated

from fastapi import Depends
from fastapi.requests import HTTPConnection
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.services import NotifService, Services, SocialService, WebService
from ravioli_core.pubsub import Publisher

from .env import ServerEnv


async def get_env(conn: HTTPConnection) -> ServerEnv:
    return conn.state["http_env"]


type EnvDep = Annotated[ServerEnv, Depends(get_env)]


async def get_services(env: EnvDep):
    return env.services


async def get_web(env: EnvDep):
    return env.services.web


async def get_notif(env: EnvDep):
    return env.services.notif


async def get_social(env: EnvDep):
    return env.services.social


type ServiceDep = Annotated[Services, Depends(get_services)]
type WebServiceDep = Annotated[WebService, Depends(get_web)]
type NotifServiceDep = Annotated[NotifService, Depends(get_notif)]
type SocialServiceDep = Annotated[SocialService, Depends(get_social)]


# ╔══════════════════════════════════════╗
# ║   DATABASE                           ║
# ╚══════════════════════════════════════╝


async def get_db_connection(env: EnvDep):
    async with env.engine.connect() as conn:
        yield conn


type DbConnection = Annotated[AsyncSession, Depends(get_db_connection, scope="function")]


async def get_session(env: EnvDep):
    async with env.session_maker() as session:
        yield session


type DbSession = Annotated[AsyncSession, Depends(get_session, scope="function")]


# NOTE : session identity map doesn't update already populated object if you double select.
# NOTE to force update => u2 = session.scalars(select(User).where(User.id == 5).execution_options(populate_existing=True)).one()


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
