from dataclasses import dataclass

from redis.asyncio import Redis

from ravioli_core.serializers import json


@dataclass(slots=True, frozen=True)
class Publisher:
    redis: Redis

    async def publish(self, chan: str, msg: object):
        return await self.redis.publish(chan, json.encode(msg))

    async def publish_many(self, chans: list[str], msg: object):
        return await self.redis.fcall("publish", len(chans), *chans, json.encode(msg))
