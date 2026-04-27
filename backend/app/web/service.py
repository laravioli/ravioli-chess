from sqlalchemy import select

from app.deps import DbSession
from ravioli_service.db.models import ChessPosition

from .deps import WebCache


async def chess_positions(session: DbSession):

    stmt = select(ChessPosition.eco, ChessPosition.name, ChessPosition.fen).order_by(
        ChessPosition.eco
    )
    result = await session.execute(stmt)
    data = [dict(row) for row in result.mappings().all()]
    return data


async def get_positions(cache: WebCache, session: DbSession):
    return await cache.get_or_set("chess:positions", factory=lambda: chess_positions(session))
