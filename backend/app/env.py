from dataclasses import dataclass

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from app.notif.service import NotifService
from app.services import Services
from app.websocket.pubsub import Broadcast, Users
from ravioli_core.config import DbSettings
from ravioli_core.ipc.channels import WsChan
from ravioli_core.pubsub import Connection
from ravioli_core.scheduler import Scheduler
from ravioli_core.utils import (
    create_async_redis,
    create_engine_and_sessionmaker,
)

from .publisher import Publisher


@dataclass(slots=True, frozen=True)
class ServerEnv:
    redis: Redis
    pub: Publisher
    engine: AsyncEngine
    session_maker: async_sessionmaker[AsyncSession]
    services: Services
    users: Users
    scheduler: Scheduler


@dataclass(slots=True, frozen=True)
class WsEnv:
    broadcast: Broadcast
    pub: Publisher
    engine: AsyncEngine
    notif: NotifService
    users: Users


def make_env():

    redis = create_async_redis()
    pub = Publisher(redis)
    scheduler = Scheduler()
    engine, session_maker = create_engine_and_sessionmaker(settings=DbSettings())
    services = Services.make(redis)
    conn = Connection(WsChan.all, redis)
    users = Users(conn, redis, scheduler)
    broadcast = Broadcast(conn, users)

    return ServerEnv(redis, pub, engine, session_maker, services, users, scheduler), WsEnv(
        broadcast, pub, engine, services.notif, users
    )
