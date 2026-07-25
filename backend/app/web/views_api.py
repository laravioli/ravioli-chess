from fastapi import APIRouter
from pydantic import BaseModel

from app.api.responses import JSONResponse
from app.deps import DBConnection
from app.env import Env


class ChessPosition(BaseModel):
    eco: str
    name: str
    fen: str


def web_api_router(env: Env):
    router = APIRouter(prefix="/web", tags=["web"])

    @router.get("/positions", response_model=list[ChessPosition])
    async def chess_positions(
        conn: DBConnection,
    ):
        data = await env.web.get_chess_positions(conn)
        return JSONResponse(content=data)

    return router
