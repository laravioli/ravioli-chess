from environs import env
from environs.exceptions import EnvError
import redis
import redis.asyncio as aioredis

try:
    socket_path = env.str('REDIS_SOCKET_PATH')
    sync_redis_client = redis.Redis(unix_socket_path=socket_path, decode_responses=True)
    async_redis_client = aioredis.Redis(unix_socket_path=socket_path,decode_responses=True)
except EnvError:
    sync_redis_client = redis.Redis(decode_responses=True)
    async_redis_client = aioredis.Redis(decode_responses=True)