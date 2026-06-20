from typing import Annotated

from fastapi import Depends
from fastapi.requests import HTTPConnection
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.services import NotifService, Services, SocialService, WebService
from app.websocket.pubsub import Users

from .env import Publisher, ServerEnv


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


async def get_users(env: EnvDep):
    return env.users


type UsersDep = Annotated[Users, Depends(get_users)]


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
