from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncConnection

from ravioli_core.db.models import ChessPosition


class WebRepo:
    async def chess_positions(self, conn: AsyncConnection):

        stmt = select(ChessPosition.eco, ChessPosition.name, ChessPosition.fen).order_by(
            ChessPosition.eco
        )
        result = await conn.execute(stmt)
        data = [dict(row) for row in result.mappings().all()]
        return data
