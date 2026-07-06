from fastapi import APIRouter, Response, status
from fastapi_pagination import resolve_params

from app.auth.deps import AuthUser
from app.deps import DbSession
from app.env import Env

from .schemas import Notification, NotifPagination


def create_notif_api_router(env: Env):
    router = APIRouter(prefix="/notif", tags=["notifications"])

    @router.get("", response_model=NotifPagination[Notification])
    async def list_notif(
        session: DbSession,
        user: AuthUser,
    ):
        params = resolve_params()
        notif = await env.notif.get_notifications(session, user.id, params)
        if isinstance(notif, bytes):
            return Response(content=notif, media_type="application/json")

        return notif

    @router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
    async def clear_notif(
        session: DbSession,
        user: AuthUser,
    ):
        await env.notif.delete_all(session, user.id)

    return router
