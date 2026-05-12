from collections.abc import Awaitable, Callable
from typing import Any

from msgspec import Struct
from pydantic import BaseModel, TypeAdapter
from redis.asyncio import Redis

from ravioli_core.serializers import json

from .utils import CacheKey, KeyParams, jitter


class Serializer[T](Struct):
    encode: Callable[[Any], bytes | str] = json.encode
    decode: Callable[[bytes | str], T] = json.decode


def json_serializer[T](type_arg: type[T] | TypeAdapter[T] | None) -> Serializer[T]:
    match type_arg:
        case type():
            if issubclass(type_arg, BaseModel):
                return Serializer(
                    lambda data: type_arg.model_validate(data).model_dump_json(),
                    lambda data: type_arg.model_validate_json(data),
                )
            else:
                return Serializer(decode=lambda data: json.decode(data, type_arg=type_arg))
        case TypeAdapter():
            return Serializer(
                lambda data: type_arg.dump_json(type_arg.validate_python(data)),
                lambda data: type_arg.validate_json(data),
            )
        case _:
            return Serializer()


class CacheLib[T]:
    """
    Cache using redis as a backend store\n
    Each instance may precise a data_type for serialization
    """

    def __init__(
        self,
        redis: Redis,
        namespace: str,
        prefix: str = "cache",
        version: str = "v1",
        default_ttl: int = 300,
        with_jitter: bool = True,
        data_type: type[T] | TypeAdapter[T] | None = None,
    ):
        assert not redis.get_encoder().decode_responses
        self.redis = redis
        self.cache_key = CacheKey(prefix=prefix, version=version, namespace=namespace)
        self.default_ttl = default_ttl
        self.with_jitter = with_jitter

        serializer = json_serializer(type_arg=data_type)
        self.encode = serializer.encode
        self.decode = serializer.decode

    def ttl(self, ttl: int | None = None):
        effective_ttl = ttl or self.default_ttl
        if self.with_jitter:
            return jitter(effective_ttl)
        return effective_ttl

    async def _get(self, key: str, **kwargs):
        return await self.redis.get(key)

    async def get(
        self,
        id: str,
        params: KeyParams = None,
        **kwargs,
    ):
        key = self.cache_key.build(id, params)
        data = await self._get(key, **kwargs)
        return self.decode(data) if data is not None else data

    async def _set(self, key: str, data: str | bytes, **kwargs):
        ex = kwargs.get("ex", self.default_ttl)
        kwargs["ex"] = self.ttl(ex)
        return await self.redis.set(key, data, **kwargs)

    async def set(
        self,
        id: str,
        value: T | Any,
        params: KeyParams = None,
        **kwargs,
    ):
        """
        Args:
            kwargs: redis `set` options
        """
        key = self.cache_key.build(id, params)
        data = self.encode(value)
        await self._set(key, data, **kwargs)

    async def get_or_set(
        self, id: str, factory: Callable[[], Awaitable[Any]], params: KeyParams = None, **kwargs
    ):
        # NOTE cache HIT/MISS might return different value
        data = await self.get(id, params)
        if data is not None:
            return data
        value = await factory()
        await self.set(id, value, params, **kwargs)
        return value

    async def delete(
        self,
        id: str,
        params: dict[str, Any] | None = None,
    ):
        key = self.cache_key.build(id, params)
        result = await self.redis.delete(key)
        return result > 0

    async def delete_by_pattern(self, pattern: str, batch_size: int = 100):
        """
        Usage:
            await cache.delete_by_pattern("user:123:*")
        """
        total_deleted = 0
        cursor = 0

        while True:
            cursor, keys = await self.redis.scan(
                cursor, match=self.cache_key.pattern(pattern), count=batch_size
            )
            if keys:
                await self.redis.unlink(*keys)
                total_deleted += len(keys)

            if cursor == 0:
                break
        return total_deleted

    async def exists(self, id: str, params: dict[str, Any] | None = None):
        key = self.cache_key.build(id, params)
        return await self.redis.exists(key) > 0
