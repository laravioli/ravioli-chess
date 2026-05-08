from fastapi.templating import Jinja2Templates
from jinja2 import Environment, PackageLoader, select_autoescape

from ravioli_core.jinja import JinjaExtConfig, load_jinja_ext

from .templating_ctx import web_context


def make_templates():

    env = Environment(
        autoescape=select_autoescape(["html", "htm", "xml"]),
        loader=PackageLoader("app.web", "templates"),
        trim_blocks=True,
        lstrip_blocks=True,
    )
    load_jinja_ext(env=env, config=JinjaExtConfig())
    return Jinja2Templates(env=env, context_processors=[web_context])
