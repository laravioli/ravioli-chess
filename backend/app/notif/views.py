from fastapi import APIRouter, Response, status
from fastapi_pagination import resolve_params

from app.auth.deps import AuthUser
from app.deps import DBConnection
from app.env import Env

from .schemas import Notification, NotifPagination


def notif_router(env: Env):
    router = APIRouter(prefix="/notif", tags=["notifications"])

    @router.get("", response_model=NotifPagination[Notification])
    async def list_notif(
        conn: DBConnection,
        user: AuthUser,
    ):
        params = resolve_params()
        notif = await env.notif.get_notifications(conn, user.id, params)
        if isinstance(notif, bytes):
            return Response(content=notif, media_type="application/json")

        return notif

    @router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
    async def clear_notif(
        conn: DBConnection,
        user: AuthUser,
    ):
        await env.notif.delete_all(conn, user.id)

    return router
