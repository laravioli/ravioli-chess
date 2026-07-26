from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

from app.env import Env

from .ctx.page import PageData
from .ctx.template import Payload
from .deps import UserCtx, UserCtxDep


def create_web_router(env: Env):
    router = APIRouter(prefix="", tags=["web"])

    def template_response(
        request: Request,
        user_ctx: UserCtx,
        page_data: PageData,
    ):
        ctx = {"user": user_ctx, "payload": Payload(page_data, user_ctx.data)}
        return env.web.templates.TemplateResponse(
            request=request,
            headers={
                "cache-control": "no-store",
                "expires": "0",
                "cross-origin-opener-policy": "same-origin",
                "cross-origin-embedder-policy": "require-corp",
            },
            name="index.html",
            context=ctx,
        )

    @router.get("/", response_class=HTMLResponse, name="root")
    async def index(
        request: Request,
        user_ctx: UserCtxDep,
    ):
        page_data = env.web.page_ctx.index()
        return template_response(request, user_ctx, page_data)

    @router.get("/analysis", response_class=HTMLResponse, name="analyse")
    async def analysis(
        request: Request,
        user_ctx: UserCtxDep,
    ):
        page_data = env.web.page_ctx.analyse()
        return template_response(request, user_ctx, page_data)

    @router.get("/editor", response_class=HTMLResponse, name="editor")
    async def editor(
        request: Request,
        user_ctx: UserCtxDep,
    ):
        page_data = env.web.page_ctx.editor()
        return template_response(request, user_ctx, page_data)

    @router.get("/play", response_class=HTMLResponse, name="play")
    async def play(
        request: Request,
        user_ctx: UserCtxDep,
    ):
        page_data = env.web.page_ctx.play()
        return template_response(request, user_ctx, page_data)

    @router.get("/profile/{username}", response_class=HTMLResponse, name="profile")
    async def profile(
        request: Request,
        user_ctx: UserCtxDep,
    ):
        page_data = env.web.page_ctx.profile()
        return template_response(request, user_ctx, page_data)

    return router
