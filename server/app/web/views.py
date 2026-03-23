import logging

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse

from app.deps import DbSession

from .deps import WebCache, user_or_anon
from .service import get_chess_positions
from .templating import templates

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["web"], dependencies=[Depends(user_or_anon)])


@router.get("/", response_class=HTMLResponse, name="root")
@router.get("/analysis", response_class=HTMLResponse, name="analyse")
@router.get("/editor", response_class=HTMLResponse, name="editor")
@router.get("/play", response_class=HTMLResponse, name="play")
@router.get("/profile/{username}", response_class=HTMLResponse, name="profile")
async def index(request: Request, session: DbSession, cache: WebCache):
    positions = await cache.get_or_set(
        "chess:positions", factory=lambda: get_chess_positions(session)
    )
    ctx = {
        "payload": {
            "cfg": {
                "user": {
                    "username": request.state.user.username,
                    "is_auth": request.state.user.is_auth,
                },
                "page": {
                    "orientation": "white",
                    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                },
            },
            "data": {"positions": positions},
        }
    }
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context=ctx,
    )
