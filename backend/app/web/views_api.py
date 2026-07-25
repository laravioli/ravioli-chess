from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel

from app.deps import DBConnection
from app.env import Env
from ravioli_core.serializers import json


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
        return Response(content=json.encode(data), media_type="application/json")

    return router
