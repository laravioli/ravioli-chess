from typing import Any

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse

from app.deps import DbSession, ServiceDep

from .deps import user_or_anon
from .views_ctx import DEFAULT_CONTEXT, analyse_ctx, editor_ctx, index_ctx, play_ctx, profile_ctx

router = APIRouter(prefix="", tags=["web"], dependencies=[Depends(user_or_anon)])


def generate_page(
    request: Request,
    services: ServiceDep,
    page_ctx: dict[str, Any] = DEFAULT_CONTEXT,
):
    user = request.state.user
    ctx = {"payload": {"user": user.info, **page_ctx}}
    return services.web.templates.TemplateResponse(
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
async def index(request: Request, services: ServiceDep, session: DbSession):
    page_ctx = await index_ctx(request.state.user, services, session)
    return generate_page(request, services, page_ctx)


@router.get("/analysis", response_class=HTMLResponse, name="analyse")
async def analysis(request: Request, services: ServiceDep, session: DbSession):
    page_ctx = await analyse_ctx(request.state.user, services, session)
    return generate_page(request, services, page_ctx)


@router.get("/editor", response_class=HTMLResponse, name="editor")
async def editor(request: Request, services: ServiceDep, session: DbSession):
    page_ctx = await editor_ctx(request.state.user, services, session)
    return generate_page(request, services, page_ctx)


@router.get("/play", response_class=HTMLResponse, name="play")
async def play(request: Request, services: ServiceDep, session: DbSession):
    page_ctx = await play_ctx(request.state.user, services, session)
    return generate_page(request, services, page_ctx)


@router.get("/profile/{username}", response_class=HTMLResponse, name="profile")
async def profile(request: Request, services: ServiceDep, session: DbSession):
    page_ctx = await profile_ctx(request.state.user, services, session)
    return generate_page(request, services, page_ctx)
