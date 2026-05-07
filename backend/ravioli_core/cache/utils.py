import hashlib
import json
import random
from dataclasses import dataclass
from typing import Any

type KeyParams = dict[str, Any] | None


@dataclass
class CacheKey:
    namespace: str
    prefix: str = "cache"
    version: str = "v1"

    def pattern(self, pattern):
        return f"{self.prefix}:{self.version}:{self.namespace}:{pattern}"

    def build(
        self,
        id: str,
        params: KeyParams = None,
    ) -> str:
        """
        Format: {prefix}:{version}:{namespace}:{id}[:{param_hash}]

        Args:
            id: unique identifier within namespace
            params: Optional dict of parameters to hash into key
        """
        parts = [self.prefix, self.version, self.namespace, id]
        if params:
            param_str = json.dumps(params, sort_keys=True)
            param_hash = hashlib.sha256(param_str.encode()).hexdigest()[:12]
            parts.append(param_hash)
        return ":".join(parts)


def jitter(base_ttl: int, jitter_percent: float = 0.1) -> int:
    jitter = int(base_ttl * jitter_percent)
    return base_ttl + random.randint(-jitter, jitter)
