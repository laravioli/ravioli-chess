from dataclasses import dataclass

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine

from app.env import ServerEnv
from app.notif.service import NotifService
from app.websocket.pubsub import Broadcast, Users
from ravioli_core.ipc.channels import WsChan
from ravioli_core.pubsub import Connection, Publisher
from ravioli_core.scheduler import Scheduler


def make_deps(redis: Redis, scheduler: Scheduler):
    conn = Connection(WsChan.all, redis)
    users = Users(conn, redis, scheduler)
    return users, Broadcast(conn, redis, users)


@dataclass(slots=True, frozen=True)
class WsEnv:
    broadcast: Broadcast
    pub: Publisher
    engine: AsyncEngine
    notif: NotifService
    users: Users

    @staticmethod
    def make(env: ServerEnv):
        users, broadcast = make_deps(env.redis, env.scheduler)
        return WsEnv(broadcast, env.pub, env.engine, env.services.notif, users)
