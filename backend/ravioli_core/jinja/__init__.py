from jinja2 import Environment

from .cache import FragmentCacheExtension
from .config import JinjaExtConfig
from .globals import add_env_globals


def load_jinja_ext(*, env: Environment, config: JinjaExtConfig):
    add_env_globals(env, config)
    if config.JINJA_CACHE_EXTENSION:
        from cachelib import SimpleCache

        env.add_extension(FragmentCacheExtension)
        env.fragment_cache = SimpleCache()  # type: ignore


__all__ = ["load_jinja_ext", "JinjaExtConfig"]
