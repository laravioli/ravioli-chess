import redis
import redis.asyncio as aioredis
from environs import env
from environs.exceptions import EnvError

try:
    socket_path = env.str("REDIS_SOCKET_PATH")
    sync_layer = redis.Redis(unix_socket_path=socket_path, decode_responses=True, db=1)
    async_layer = aioredis.Redis(
        unix_socket_path=socket_path, decode_responses=True, db=1
    )
except EnvError:
    sync_layer = redis.Redis(decode_responses=True, db=1)
    async_layer = aioredis.Redis(decode_responses=True, db=1)
