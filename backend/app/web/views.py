from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

from app.deps import PoolConnection
from app.env import Env

from .ctx.page import PagePayload
from .deps import UserCtx, UserCtxDep


def create_web_router(env: Env):
    router = APIRouter(prefix="", tags=["web"])

    def template_response(
        request: Request,
        user_ctx: UserCtx,
        page_payload: PagePayload,
    ):
        ctx = {"user": user_ctx, "payload": {**page_payload, "user": user_ctx.payload}}
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
        conn: PoolConnection,
        request: Request,
        user_ctx: UserCtxDep,
    ):
        page_payload = await env.web.page_ctx.index(conn)
        return template_response(request, user_ctx, page_payload)

    @router.get("/analysis", response_class=HTMLResponse, name="analyse")
    async def analysis(
        conn: PoolConnection,
        request: Request,
        user_ctx: UserCtxDep,
    ):
        page_payload = await env.web.page_ctx.analyse(conn)
        return template_response(request, user_ctx, page_payload)

    @router.get("/editor", response_class=HTMLResponse, name="editor")
    async def editor(
        conn: PoolConnection,
        request: Request,
        user_ctx: UserCtxDep,
    ):
        page_payload = await env.web.page_ctx.editor(conn)
        return template_response(request, user_ctx, page_payload)

    @router.get("/play", response_class=HTMLResponse, name="play")
    async def play(
        request: Request,
        user_ctx: UserCtxDep,
    ):
        page_payload = await env.web.page_ctx.play()
        return template_response(request, user_ctx, page_payload)

    @router.get("/profile/{username}", response_class=HTMLResponse, name="profile")
    async def profile(
        request: Request,
        user_ctx: UserCtxDep,
    ):
        page_payload = await env.web.page_ctx.profile()
        return template_response(request, user_ctx, page_payload)

    return router
