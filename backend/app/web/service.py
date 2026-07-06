from fastapi.templating import Jinja2Templates
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.notif.service import NotifService
from ravioli_core.cache import CacheLib
from ravioli_core.db.models import ChessPosition

from .templating import make_templates
from .views_ctx import ContextBuilder


class WebService:
    def __init__(
        self,
        chess_cache: CacheLib,
        templates: Jinja2Templates,
        notif: NotifService,
    ):
        self._chess_cache = chess_cache
        self.templates = templates
        self.ctx_builder = ContextBuilder(self, notif)

    @staticmethod
    async def _db_chess_positions(session: AsyncSession):

        stmt = select(ChessPosition.eco, ChessPosition.name, ChessPosition.fen).order_by(
            ChessPosition.eco
        )
        result = await session.execute(stmt)
        data = [dict(row) for row in result.mappings().all()]
        return data

    async def get_chess_positions(self, session: AsyncSession):
        return await self._chess_cache.get_or_set(
            "chess:positions", factory=lambda: self._db_chess_positions(session)
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
            notif=notif,
        )
