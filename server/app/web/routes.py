from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse

from .deps import inject_user_or_anon
from .templating import templates

router = APIRouter(prefix="", tags=["web"], dependencies=[Depends(inject_user_or_anon)])


@router.get("/", response_class=HTMLResponse, name="root")
async def read_item(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")
