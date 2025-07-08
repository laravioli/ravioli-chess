import redis
import redis.asyncio as aioredis

sync_redis_client = redis.Redis(decode_responses=True)
async_redis_client = aioredis.Redis(decode_responses=True)