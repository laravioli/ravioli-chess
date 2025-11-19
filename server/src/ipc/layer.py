import redis.asyncio as aioredis
from environs import env
from collections import defaultdict
from environs.exceptions import EnvError
from typing import overload, Literal

try:
    socket_path = env.str("REDIS_SOCKET_PATH")
except EnvError:
    socket_path = None


class Layer:
    "websocket <-> game_backend"

    BACKENDS = {
        "redis": aioredis.Redis,
    }

    DEFAULT_CONFIG = {
        "redis": {"unix_socket_path": socket_path, "decode_responses": False, "db": 1},
    }

    def __init__(self):
        self.backends = {}
        self.config_overrides = defaultdict(dict)

    def __getitem__(self, key):
        if key not in self.backends:
            config = self.DEFAULT_CONFIG.get(key, {}) | self.config_overrides[key]
            self.backends[key] = self.BACKENDS[key](**config)
        return self.backends[key]

    def set_config(self, key, **kwargs):
        if key in self.backends:
            raise RuntimeError("Backend already created, cannot set config")
        self.config_overrides[key] |= kwargs


@overload
def get_layer(key: Literal["redis"]) -> aioredis.Redis: ...
def get_layer(key):
    return layer[key]


layer = Layer()
