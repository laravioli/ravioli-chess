import redis.asyncio as aioredis
from typing import overload, Literal

from django.conf import settings


class RavioliLayerManager:
    "Container that lazily provide an ipc AND cache client"

    BACKENDS = {
        "redis": lambda location, options: aioredis.Redis.from_url(location, **options),
    }

    def __init__(self):
        self.backends = {}

    @property
    def default_config(self):
        return getattr(settings, "RAVIOLI_LAYERS", {})

    def __getitem__(self, key):
        if key not in self.backends:
            config = self.default_config[key]
            self.backends[key] = self.BACKENDS[config["BACKEND"]](
                config["LOCATION"], config["OPTIONS"]
            )
        return self.backends[key]


@overload
def get_layer(key: Literal["redis"]) -> aioredis.Redis: ...
def get_layer(key="default"):
    return layer[key]


layer = RavioliLayerManager()
