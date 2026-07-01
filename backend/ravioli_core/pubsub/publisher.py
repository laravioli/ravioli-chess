from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Any

from redis.asyncio import Redis

from ravioli_core.ipc.channels import WsChan
from ravioli_core.serializers import json


@dataclass(slots=True, frozen=True)
class Publisher:
    redis: Redis

    async def publish(self, chan: str, msg: object):
        return await self.redis.publish(chan, json.encode(msg))

    async def publish_to_many(self, chans: list[str], msg: object):
        return await self.redis.fcall("publish", len(chans), *chans, json.encode(msg))  # type: ignore

    async def publish_to_online_user(self, user_id: str, lazy_msg: Callable[[], Awaitable[Any]]):
        chan = WsChan.users(user_id)
        if await self._has_subscriber(chan):
            msg = await lazy_msg()
            await self.publish(chan, msg)

    async def _has_subscriber(self, chan) -> bool:
        return (await self.redis.pubsub_numsub(chan))[0][1] > 0
