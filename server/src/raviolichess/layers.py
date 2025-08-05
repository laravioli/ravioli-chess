import redis
import redis.asyncio as aioredis
from environs import env
from environs.exceptions import EnvError


class RedisLayer:

    def __init__(self):
        self.backends = {}

    def __getitem__(self, key):
        if key not in self.backends:
            self.backends[key] = self.make_backend(key)
        return self.backends[key]

    def make_backend(self, key):
        try:
            socket_path = env.str("REDIS_SOCKET_PATH")
        except EnvError:
            socket_path = None

        if key == "sync":
            backend = redis.Redis
        elif key == "async":
            backend = aioredis.Redis
        else:
            raise KeyError

        if socket_path:
            return backend(unix_socket_path=socket_path, decode_responses=True, db=1)
        else:
            return backend(decode_responses=True, db=1)


def get_redis_layer(key) -> redis.Redis | aioredis.Redis:
    return redis_layers[key]


redis_layers = RedisLayer()
