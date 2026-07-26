from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel

from app.env import Env

from .static_data.chess_positions import positions


class ChessPosition(BaseModel):
    eco: str
    name: str
    fen: str


def web_api_router(env: Env):  # noqa: ARG001
    router = APIRouter(prefix="/web", tags=["web"])

    @router.get("/positions", response_model=list[ChessPosition])
    async def chess_positions():
        return Response(content=positions.json, media_type="application/json")

    return router
