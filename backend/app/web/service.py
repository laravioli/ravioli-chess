from fastapi.templating import Jinja2Templates
from redis.asyncio import Redis

from app.notif.service import NotifService
from ravioli_core.cache import CacheLib
from ravioli_core.db.types import PGConnection

from .ctx.page import PageCtx
from .repo import WebRepo
from .templating import make_templates


class WebService:
    def __init__(self, chess_cache: CacheLib, templates: Jinja2Templates, repo: WebRepo):
        self._chess_cache = chess_cache
        self.templates = templates
        self.page_ctx = PageCtx(self)
        self._repo = repo

    async def get_chess_positions(
        self,
        conn: PGConnection,
    ):
        return await self._chess_cache.get_or_set(
            "chess:positions", factory=lambda: self._repo.chess_positions(conn)
        )

    @staticmethod
    def make(*, redis: Redis, notif: NotifService):
        return WebService(
            chess_cache=CacheLib(
                redis,
                namespace="chess",
                version="v1",
                default_ttl=900,
                data_type=list,
            ),
            templates=make_templates(),
            repo=WebRepo(),
        )
