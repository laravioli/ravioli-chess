from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel

from app.deps import DbSession, WebServiceDep
from ravioli_core.serializers import json

router = APIRouter(prefix="/web", tags=["web"])


class ChessPosition(BaseModel):
    eco: str
    name: str
    fen: str


@router.get("/positions", response_model=list[ChessPosition])
async def chess_positions(service: WebServiceDep, session: DbSession):
    data = await service.get_chess_positions(session)
    return Response(content=json.encode(data), media_type="application/json")
