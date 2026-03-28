from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel

from app.deps import DbSession
from lib.serializers import json

from .deps import WebCache
from .service import get_positions

router = APIRouter(prefix="/web", tags=["web"])


class ChessPosition(BaseModel):
    eco: str
    name: str
    fen: str


@router.get("/positions", response_model=list[ChessPosition])
async def chess_positions(cache: WebCache, session: DbSession):
    data = await get_positions(cache, session)
    return Response(content=json.encode(data), media_type="application/json")
