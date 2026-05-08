from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse

from app.deps import DbSession, WebServiceDep

from .deps import user_or_anon
from .views_ctx import DEFAULT_CONTEXT, analyse_ctx, editor_ctx, index_ctx, play_ctx

router = APIRouter(prefix="", tags=["web"], dependencies=[Depends(user_or_anon)])


def generate_page(
    request: Request,
    service: WebServiceDep,
    page_ctx: dict[str, any] = DEFAULT_CONTEXT,
):
    user = request.state.user
    ctx = {"payload": {"user": user.info, **page_ctx}}
    return service.templates.TemplateResponse(
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
async def index(request: Request, service: WebServiceDep, session: DbSession):
    page_ctx = await index_ctx(service, session)
    return generate_page(request, service, page_ctx)


@router.get("/analysis", response_class=HTMLResponse, name="analyse")
async def analysis(request: Request, service: WebServiceDep, session: DbSession):
    page_ctx = await analyse_ctx(service, session)
    return generate_page(request, service, page_ctx)


@router.get("/editor", response_class=HTMLResponse, name="editor")
async def editor(request: Request, service: WebServiceDep, session: DbSession):
    page_ctx = await editor_ctx(service, session)
    return generate_page(request, service, page_ctx)


@router.get("/play", response_class=HTMLResponse, name="play")
async def play(request: Request, service: WebServiceDep):
    page_ctx = play_ctx()
    return generate_page(request, service, page_ctx)


@router.get("/profile/{username}", response_class=HTMLResponse, name="profile")
async def profile(request: Request, service: WebServiceDep):
    return generate_page(request, service)
