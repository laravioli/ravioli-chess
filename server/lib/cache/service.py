import logging
from collections.abc import Awaitable, Callable
from typing import Any, TypeVar

from msgspec import Struct
from pydantic import BaseModel, TypeAdapter
from redis.asyncio import Redis

from lib.serializers import json

from .utils import (
    build_cache_key,
    get_ttl_with_jitter,
)

logger = logging.getLogger(__name__)

type Serializable = BaseModel | TypeAdapter | Struct | dict[str, Any] | str

T = TypeVar("T")


class CacheService:
    """
    Example:
    user_cache = CacheService(
            redis_client,
            namespace="users",
            model=User,
            default_ttl=600
        )
        user = await user_cache.get("123")
        await user_cache.set("123", user_obj, ttl=600)
    """

    def __init__(
        self,
        redis: Redis,
        namespace: str,
        model: BaseModel | TypeAdapter | Struct | None = None,
        default_ttl: int = 300,
        use_jitter: bool = True,
        prefix: str = "cache",
        version: str = "v1",
    ):
        self.redis = redis
        self.namespace = namespace
        self.model = model
        self.default_ttl = default_ttl
        self.use_jitter = use_jitter
        self.prefix = prefix
        self.version = version

    def _build_key(self, identifier: str, params: dict[str, Any] | None = None) -> str:
        """
        Build namespaced cache key
        """
        return build_cache_key(
            self.namespace,
            identifier,
            params,
            prefix=self.prefix,
            version=self.version,
        )

    def _get_ttl(self, ttl: int | None = None) -> int:
        """
        Get TTL with optional jitter
        """
        effective_ttl = ttl or self.default_ttl
        if self.use_jitter:
            return get_ttl_with_jitter(effective_ttl)
        return effective_ttl

    async def get(
        self,
        identifier: str,
        params: dict[str, Any] | None = None,
    ) -> Serializable | None:
        """
        Get cached value, deserialize to Pydantic model if configured
        """
        key = self._build_key(identifier, params)
        data = await self.redis.get(key)

        if data is None:
            return None
        if self.model:
            if isinstance(self.model, TypeAdapter):
                return self.model.validate_json(data)
            elif isinstance(self.model, type):
                if issubclass(self.model, BaseModel):
                    return self.model.model_validate_json(data)
                elif issubclass(self.model, Struct):
                    return json.decode(data, type_arg=self.model)
        else:
            return json.decode(data)

    async def set(
        self,
        identifier: str,
        value: Serializable | bytes,
        ttl: int | None = None,
        params: dict[str, Any] | None = None,
    ) -> None:
        """
        Set cached value

        """

        key = self._build_key(identifier, params)
        effective_ttl = self._get_ttl(ttl)
        match value:
            case bytes():
                pass
            case BaseModel():
                value = value.model_dump_json()
            case _:
                if self.model:
                    if isinstance(self.model, TypeAdapter):
                        value = self.model.dump_json(self.model.validate_python(value))
                    elif isinstance(self.model, type) and issubclass(self.model, BaseModel):
                        value = self.model.model_validate(value).model_dump_json()
                else:
                    value = json.encode(value)

        await self.redis.set(key, value, ex=effective_ttl)

    async def get_or_set(
        self,
        identifier: str,
        factory: Callable[[], Awaitable[T]],
        ttl: int | None = None,
        params: dict[str, Any] | None = None,
    ) -> Serializable | T:
        """
        cache-aside

        Usage:
            user = await cache.get_or_set(
                "123",
                factory=lambda: db.get_user(123),
                ttl=600
            )
        """
        cached = await self.get(identifier, params)
        if cached is not None:
            return cached

        value = await factory()

        if self.model:
            # try to have same return value as get
            if isinstance(self.model, TypeAdapter):
                validated_value = self.model.validate_python(value)
                await self.set(identifier, self.model.dump_json(validated_value), ttl, params)
                return validated_value
            elif isinstance(self.model, type) and issubclass(self.model, BaseModel):
                validated_value = (
                    value if isinstance(value, BaseModel) else self.model.model_validate(value)
                )
                await self.set(identifier, validated_value.model_dump_json(), ttl, params)
                return validated_value

        await self.set(identifier, value, ttl, params)
        return value

    async def delete(self, identifier: str, params: dict[str, Any] | None = None) -> bool:
        """
        Delete cached value
        """
        key = self._build_key(identifier, params)
        result = await self.redis.delete(key)
        return result > 0

    async def delete_by_pattern(self, pattern: str, batch_size: int = 100) -> int:
        """
        Invalidate all keys matching pattern in this namespace

        Usage:
            await cache.delete_by_pattern("user:123:*")
        """
        total_deleted = 0
        cursor = 0
        full_pattern = f"{self.prefix}:{self.version}:{self.namespace}:{pattern}"

        while True:
            cursor, keys = await self.redis.scan(cursor, match=full_pattern, count=batch_size)
            if keys:
                await self.redis.unlink(*keys)
                total_deleted += len(keys)

            if cursor == 0:
                break
        return total_deleted

    async def exists(self, identifier: str, params: dict[str, Any] | None = None) -> bool:
        """
        Check if key exists in cache
        """
        key = self._build_key(identifier, params)
        return await self.redis.exists(key) > 0

    async def get_ttl(self, identifier: str, params: dict[str, Any] | None = None) -> int:
        """
        Get remaining TTL for key in seconds

        Returns -2 if key doesn't exist, -1 if key has no expiration
        """
        try:
            key = self._build_key(identifier, params)
            return await self.redis.ttl(key)
        except Exception as e:
            logger.warning(f"TTL check failed for {identifier}: {e}")
            return -2
