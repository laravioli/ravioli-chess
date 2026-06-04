from functools import cached_property

from redis.asyncio import Redis

from app.config import settings
from ravioli_core.pubsub.types import Subscriber
from ravioli_core.pubsub.utils import LazyEvent
from ravioli_core.scheduler import Scheduler


class Users:
    def __init__(self, redis: Redis, scheduler: Scheduler):
        self._users: dict[str, set[Subscriber]] = {}
        self._disconnects: set[str] = set()
        self._flush_disconnects: set[str] = set()
        self._flush_disconnects_event = LazyEvent()
        self.redis = redis

        @scheduler.periodic(5.0, 7.0)
        async def flush_disconnects():
            self._flush_disconnects = self._disconnects.copy()
            self._disconnects.clear()
            if self._flush_disconnects:
                with self._flush_disconnects_event:
                    try:
                        await self.redis.srem(self.presence_key, *self._flush_disconnects)
                    finally:
                        self._flush_disconnects.clear()

    @cached_property
    def presence_key(self):
        return f"presence:{settings.WORKER_ID}"

    async def connect(self, user_id: str, sub: Subscriber):
        match self._users.get(user_id):
            case None:
                self._users[user_id] = {sub}
                try:
                    self._disconnects.remove(user_id)
                except KeyError:
                    # this avoid race where user appear offline while online
                    while user_id in self._flush_disconnects:
                        # we ensure srem -> sadd
                        await self._flush_disconnects_event.wait()
                    # end
                    await self.redis.sadd(self.presence_key, user_id)

            case set(subs):
                subs.add(sub)

    def disconnect(self, user_id: str, sub: Subscriber):
        subs = self._users.get(user_id)
        if subs:
            subs.remove(sub)
            if len(subs) == 0:
                self._disconnects.add(user_id)
                del self._users[user_id]

    def tell_one(self, user_id: str, msg: str):
        try:
            for sub in self._users[user_id]:
                sub.put_nowait(msg)
        except KeyError:
            pass

    def tell_many(self, user_ids: list[str], msg: str):
        for user_id in user_ids:
            self.tell_one(user_id, msg)
