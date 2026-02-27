from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, PackageLoader, select_autoescape

env = Environment(
    autoescape=select_autoescape(["html", "htm", "xml"]),
    loader=PackageLoader("app.web", "templates"),
    trim_blocks=True,
    lstrip_blocks=True,
)

templates = Jinja2Templates(env=env)

router = APIRouter(prefix="", tags=["web"])

# todo: build a small django-vite layer using globals (a config and some globals)
# add context_processor


@router.get("/", response_class=HTMLResponse, name="root")
async def read_item(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")
