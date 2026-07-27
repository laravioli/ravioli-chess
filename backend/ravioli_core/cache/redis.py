import asyncio
import logging

from pydantic import TypeAdapter
from redis.asyncio import Redis
from redis.exceptions import RedisError

from .utils import CacheSerializer, Jitter, KeyBuilder, ValueBuilder

logger = logging.getLogger(__name__)


class RedisCache[T, **P]:
    def __init__(
        self,
        *,
        redis: Redis,
        prefix: str = "cache",
        version: str = "v1",
        name: str,
        ttl: int = 300,
        ratio_ttl: float = 0.1,
        value_type: type[T] | TypeAdapter[T],
        value_builder: ValueBuilder[T, P],
    ):
        self._redis = redis
        self._key_builder = KeyBuilder(prefix=prefix, version=version, name=name)
        self._value_builder = value_builder
        self._encode, self._decode = CacheSerializer[T].make(value_type=value_type)
        self._jitter = Jitter(ttl=ttl, ratio=ratio_ttl)
        self._get_or_set_futures: dict[str, asyncio.Future[T]] = {}

    async def _get(
        self,
        computed_key: str,
    ):
        """
        Get hook allowing subclasses to change get methods behavior

        :param computed_key: key already transformed by key builder
        :returns: Return the value at key name, or None if the key doesn't exist

        """
        return await self._redis.get(computed_key)

    async def _set(
        self,
        computed_key: str,
        encoded_value: str | bytes,
        **kwargs,
    ):
        """
        Set hook allowing subclasses to change set methods behavior

        :param computed_key: key already transformed by key builder
        :params encoded_value: raw value to set computed_key

        """
        return await self._redis.set(computed_key, encoded_value, **kwargs)

    async def get_if_present(
        self,
        key: str,
        *args,
        default: T | None = None,
        **kwargs,
    ):
        value = await self._get(self._key_builder(key), *args, **kwargs)
        return self._decode(value) if value else default

    async def set(
        self,
        key: str,
        value: T,
        **kwargs,
    ):
        await self._set(
            self._key_builder(key), self._encode(value), ex=self._jitter.compute(), **kwargs
        )

    async def get_or_set(
        self,
        key: str,
        *args: P.args,
        **kwargs: P.kwargs,
    ):
        fut = self._get_or_set_futures.get(key)
        if fut:
            return await fut
        else:
            loop = asyncio.get_running_loop()
            self._get_or_set_futures[key] = fut = loop.create_future()

            try:
                value = await self.get_if_present(key)
                if value is not None:
                    fut.set_result(value)
                    return value

                new_val = await self._value_builder(key, *args, **kwargs)

                if new_val is None:
                    raise ValueError("builder function did not provide a value")

                fut.set_result(new_val)

                try:
                    await self.set(key, new_val, nx=True)
                except RedisError:
                    logger.warning(
                        "failed to populate cache",
                        extra={"cache_key": key, "cache": self._key_builder.name},
                        exc_info=True,
                    )
            except asyncio.CancelledError:
                fut.cancel()
                raise
            except Exception as e:
                fut.set_exception(e)
                raise
            finally:
                self._get_or_set_futures.pop(key, None)

            return new_val

    async def delete(self, *keys: str):
        await self._redis.delete(*[self._key_builder(key) for key in keys])

    async def exists(self, key: str):
        return await self._redis.exists(self._key_builder(key)) > 0
