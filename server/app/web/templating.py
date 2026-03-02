from fastapi.templating import Jinja2Templates
from jinja2 import Environment, PackageLoader, select_autoescape
from jinja_vite import JinjaViteConfig, add_jinja_vite_globals
from starlette.requests import Request

from .ctx import web_context

env = Environment(
    autoescape=select_autoescape(["html", "htm", "xml"]),
    loader=PackageLoader("app.web", "templates"),
    trim_blocks=True,
    lstrip_blocks=True,
)
jinja_vite_config = JinjaViteConfig()
add_jinja_vite_globals(env=env, config=jinja_vite_config)


def user_context(request: Request):
    return {"user": request.state.user}


templates = Jinja2Templates(env=env, context_processors=[web_context])
