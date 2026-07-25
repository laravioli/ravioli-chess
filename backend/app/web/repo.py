from ravioli_core.db.queries import WebQueries
from ravioli_core.db.types import PGConnection


class WebRepo:
    async def chess_positions(self, conn: PGConnection):
        return [dict(**cp) for cp in await conn.fetch(WebQueries.chess_positions)]
