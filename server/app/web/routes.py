from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, PackageLoader, select_autoescape
from jinja_vite import add_jinja_vite_globals

env = Environment(
    autoescape=select_autoescape(["html", "htm", "xml"]),
    loader=PackageLoader("app.web", "templates"),
    trim_blocks=True,
    lstrip_blocks=True,
)

add_jinja_vite_globals(env=env)

templates = Jinja2Templates(env=env)

router = APIRouter(prefix="", tags=["web"])


@router.get("/", response_class=HTMLResponse, name="root")
async def read_item(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")
