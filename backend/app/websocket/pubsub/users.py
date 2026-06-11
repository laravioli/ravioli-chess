import asyncio
from contextlib import suppress
from functools import cached_property

from redis.asyncio import Redis

from app.config import settings
from app.websocket.schemas import MaybeUser
from ravioli_core.ipc.channels import WsChan
from ravioli_core.pubsub import Connection
from ravioli_core.pubsub.types import Subscriber
from ravioli_core.pubsub.utils import LazyEvent
from ravioli_core.scheduler import Scheduler

type UserId = str
type UserChannelId = str


class Users:
    def __init__(
        self,
        connection: Connection,
        redis: Redis,
        scheduler: Scheduler,
    ):
        self._users: dict[UserId, set[Subscriber]] = {}

        self._disconnects: set[UserId] = set()
        self._flush_disconnects: set[UserId] = set()
        self._flush_disconnects_event = LazyEvent()

        self._redis = redis
        self._connection = connection

        @scheduler.periodic(5.0, 7.0)
        async def flush_disconnects():
            self._flush_disconnects = self._disconnects.copy()
            self._disconnects.clear()
            if self._flush_disconnects:
                with self._flush_disconnects_event:
                    try:
                        async with asyncio.TaskGroup() as tg:
                            tg.create_task(
                                self._redis.srem(self.presence_key, *self._flush_disconnects)
                            )
                            user_chans = (WsChan.users(uid) for uid in self._flush_disconnects)
                            await self._connection.unsubscribe(user_chans)
                    finally:
                        self._flush_disconnects.clear()

    @cached_property
    def presence_key(self):
        return f"presence:{settings.NODE_ID}"

    async def connect(self, sub: Subscriber, user: MaybeUser):
        """
        Returns:
            Optional[str] : pubsub channel to subscribe to

        """
        if user:
            user_id = user.id
            subs = self._users.get(user_id)
            if subs is None:
                self._users[user_id] = {sub}
                try:
                    self._disconnects.remove(user_id)
                except KeyError:
                    # this avoid race where user appear offline while online
                    if user_id in self._flush_disconnects:
                        # we ensure srem -> sadd
                        with suppress(asyncio.TimeoutError):
                            await asyncio.wait_for(self._flush_disconnects_event.wait(), 1)
                    # end
                    await self._redis.sadd(self.presence_key, user_id)

                    # the caller can add this channel to a pubsub connection
                    return WsChan.users(user_id)

            else:
                subs.add(sub)

    def disconnect(self, sub: Subscriber, user: MaybeUser):
        if user:
            user_id = user.id

            subs = self._users.get(user_id)
            if subs:
                subs.discard(sub)
                if len(subs) == 0:
                    self._disconnects.add(user_id)
                    del self._users[user_id]

    def tell_one(self, user_id: str, msg: str):
        try:
            for sub in self._users[user_id]:
                sub.put_nowait(msg)
        except KeyError:
            pass

    def tell_many(self, user_ids: list[UserId], msg: str):
        for user_id in user_ids:
            self.tell_one(user_id, msg)
