from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse

from app.db.deps import DbSession

from .deps import user_or_anon
from .service import get_chess_positions
from .templating import templates

router = APIRouter(prefix="", tags=["web"], dependencies=[Depends(user_or_anon)])


@router.get("/", response_class=HTMLResponse, name="root")
async def read_item(request: Request, session: DbSession):
    positions = await get_chess_positions(session)
    ctx = {
        "payload": {
            "cfg": {
                "user": {
                    "username": request.state.user.username,
                    "is_auth": request.state.user.is_auth,
                }
            },
            "data": {"positions": positions},
        }
    }
    return templates.TemplateResponse(request=request, name="index.html", context=ctx)
