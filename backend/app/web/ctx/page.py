from typing import TYPE_CHECKING, Any, NotRequired, TypedDict

from ravioli_core.db.types import PGConnection

if TYPE_CHECKING:
    from app.web.service import WebService


class PageData(TypedDict):
    orientation: NotRequired[str]
    fen: NotRequired[str]


CHESS_DEFAULT = PageData(
    orientation="white", fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
)


class Metadata(TypedDict):
    positions: NotRequired[list[Any]]


class PagePayload(TypedDict):
    page: PageData
    data: NotRequired[Metadata]


class PageCtx:
    def __init__(self, web: "WebService"):
        self._web = web

    async def index(self, conn: PGConnection):
        return PagePayload(
            page=CHESS_DEFAULT, data=Metadata(positions=await self._web.get_chess_positions(conn))
        )

    async def analyse(
        self,
        conn: PGConnection,
    ):
        return PagePayload(
            page=CHESS_DEFAULT, data=Metadata(positions=await self._web.get_chess_positions(conn))
        )

    async def editor(
        self,
        conn: PGConnection,
    ):
        return PagePayload(
            page=CHESS_DEFAULT, data=Metadata(positions=await self._web.get_chess_positions(conn))
        )

    async def play(
        self,
    ):
        return PagePayload(page=CHESS_DEFAULT)

    async def profile(
        self,
    ):
        return PagePayload(page=CHESS_DEFAULT)
