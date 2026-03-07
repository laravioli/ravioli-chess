from jinja2 import Environment

from .cache import FragmentCacheExtension
from .config import JinjaViteConfig
from .globals import add_globals


def load_jinja_vite(*, env: Environment, config: JinjaViteConfig):
    add_globals(env, config)
    if config.JINJA_CACHE_EXTENSION:
        from cachelib import SimpleCache

        env.add_extension(FragmentCacheExtension)
        env.fragment_cache = SimpleCache()


__all__ = ["load_jinja_vite", "JinjaViteConfig"]
