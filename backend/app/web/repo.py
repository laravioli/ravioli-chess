from ravioli_core.db.queries import WebQueries
from ravioli_core.db.types import PGConnection


class WebRepo:
    async def chess_positions(self, conn: PGConnection):
        cps = await conn.fetch(WebQueries.chess_positions)
        return [dict(**cp) for cp in cps]
