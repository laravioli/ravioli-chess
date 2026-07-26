from fastapi.templating import Jinja2Templates

from .ctx.page import PageCtx
from .templating import make_templates


class WebService:
    def __init__(self, templates: Jinja2Templates):
        self.templates = templates
        self.page_ctx = PageCtx()

    @staticmethod
    def make():
        return WebService(
            templates=make_templates(),
        )
