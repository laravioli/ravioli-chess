import asyncio
from pathlib import Path

from ravioli_core.config import RedisSettings
from ravioli_core.ipc.utils import create_async_redis

redis = create_async_redis(RedisSettings())  # type: ignore
script_path = f"{Path(__file__).resolve().parent}/redis-script.lua"


async def load_redis_script():
    with open(script_path) as f:
        await redis.function_load(f.read(), replace=True)  # type: ignore


if __name__ == "__main__":
    asyncio.run(load_redis_script())
