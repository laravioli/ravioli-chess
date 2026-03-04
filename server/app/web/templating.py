from fastapi.templating import Jinja2Templates
from jinja2 import Environment, PackageLoader, select_autoescape
from jinja_vite import JinjaViteConfig, load_jinja_vite

from .ctx import web_context

env = Environment(
    autoescape=select_autoescape(["html", "htm", "xml"]),
    loader=PackageLoader("app.web", "templates"),
    trim_blocks=True,
    lstrip_blocks=True,
)

jinja_vite_config = JinjaViteConfig()
load_jinja_vite(env=env, config=jinja_vite_config)


templates = Jinja2Templates(env=env, context_processors=[web_context])
