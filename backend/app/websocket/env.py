from dataclasses import dataclass

from redis.asyncio import Redis

from app.notif.service import NotifService
from app.websocket.pubsub import Broadcast, Users
from ravioli_core.ipc.channels import WsChan
from ravioli_core.pubsub import Connection
from ravioli_core.scheduler import Scheduler


@dataclass(slots=True, frozen=True)
class WsEnv:
    broadcast: Broadcast
    notif: NotifService
    users: Users

    @staticmethod
    def make(*, redis: Redis, scheduler: Scheduler, notif: NotifService):
        conn = Connection(WsChan.all, redis)
        users = Users(conn, redis, scheduler)
        broadcast = Broadcast(conn, users)

        return WsEnv(broadcast, notif, users)
