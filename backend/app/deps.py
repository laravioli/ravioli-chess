import asyncio
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends
from fastapi.requests import HTTPConnection
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from app.service import NotifService, Service, SocialService, WebService
from app.websocket.broadcast import make_topics
from ravioli_core.config import DbSettings, RedisSettings
from ravioli_core.pubsub import Broadcast
from ravioli_core.utils import (
    create_async_redis,
    create_engine_and_sessionmaker,
)

# ╔══════════════════════════════════════╗
# ║   ENV                                ║
# ╚══════════════════════════════════════╝


@dataclass(init=False, slots=True)
class Env:
    redis: Redis
    broadcast: Broadcast
    engine: AsyncEngine
    session_maker: async_sessionmaker[AsyncSession]
    service: Service

    def __init__(self):
        self.redis = create_async_redis(settings=RedisSettings())
        self.broadcast = Broadcast(redis=self.redis, topics=make_topics)
        self.engine, self.session_maker = create_engine_and_sessionmaker(settings=DbSettings())
        self.service = Service.make(self.redis)

    async def on_start(self):
        await self.broadcast.start()

    async def on_stop(self):
        await asyncio.gather(self.broadcast.stop(), self.engine.dispose())
        await self.redis.aclose()


async def get_env(conn: HTTPConnection):
    return conn.state["env"]


type EnvDep = Annotated[Env, Depends(get_env)]


async def get_services(env: EnvDep):
    return env.service


async def get_web(env: EnvDep):
    return env.service.web


async def get_notif(env: EnvDep):
    return env.service.notif


async def get_social(env: EnvDep):
    return env.service.social


type ServiceDep = Annotated[Service, Depends(get_services)]
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
# ║   BROADCAST                          ║
# ╚══════════════════════════════════════╝


async def get_broadcast(env: EnvDep):
    return env.broadcast


type BroadCastClient = Annotated[Broadcast, Depends(get_broadcast)]
