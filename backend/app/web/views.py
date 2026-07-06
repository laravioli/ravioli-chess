from typing import Any

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse

from app.deps import DbConnection
from app.env import Env

from .deps import user_or_anon
from .views_ctx import DEFAULT_CONTEXT


def create_web_router(env: Env):
    router = APIRouter(prefix="", tags=["web"], dependencies=[Depends(user_or_anon)])

    def generate_page(
        request: Request,
        page_ctx: dict[str, Any] = DEFAULT_CONTEXT,
    ):
        user = request.state.user
        ctx = {"payload": {"user": user.info, **page_ctx}}
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
        conn: DbConnection,
        request: Request,
    ):
        page_ctx = await env.web.ctx_builder.index(conn, request.state.user)
        return generate_page(request, page_ctx)

    @router.get("/analysis", response_class=HTMLResponse, name="analyse")
    async def analysis(
        conn: DbConnection,
        request: Request,
    ):
        page_ctx = await env.web.ctx_builder.analyse(conn, request.state.user)
        return generate_page(request, page_ctx)

    @router.get("/editor", response_class=HTMLResponse, name="editor")
    async def editor(
        conn: DbConnection,
        request: Request,
    ):
        page_ctx = await env.web.ctx_builder.editor(conn, request.state.user)
        return generate_page(request, page_ctx)

    @router.get("/play", response_class=HTMLResponse, name="play")
    async def play(
        conn: DbConnection,
        request: Request,
    ):
        page_ctx = await env.web.ctx_builder.play(conn, request.state.user)
        return generate_page(request, page_ctx)

    @router.get("/profile/{username}", response_class=HTMLResponse, name="profile")
    async def profile(
        conn: DbConnection,
        request: Request,
    ):
        page_ctx = await env.web.ctx_builder.profile(conn, request.state.user)
        return generate_page(request, page_ctx)

    return router
