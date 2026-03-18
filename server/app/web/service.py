from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.db.models import ChessPosition


async def get_chess_positions(session: AsyncSession):

    stmt = select(ChessPosition.eco, ChessPosition.name, ChessPosition.fen).order_by(
        ChessPosition.eco
    )
    result = await session.execute(stmt)
    data = [dict(row) for row in result.mappings().all()]
    return data
