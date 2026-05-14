from fastapi import APIRouter, Response, status
from fastapi_pagination import resolve_params

from app.auth.deps import AuthUser
from app.deps import DbSession, NotifServiceDep

from .schemas import Notification, NotifPagination

router = APIRouter(prefix="/notif", tags=["notifications"])


@router.get("", response_model=NotifPagination[Notification])
async def list_notif(
    session: DbSession,
    service: NotifServiceDep,
    user: AuthUser,
):
    params = resolve_params()
    notif = await service.get_notifications(session, user.id, params)
    if isinstance(notif, bytes):
        return Response(content=notif, media_type="application/json")

    return notif


@router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
async def clear_notif(
    session: DbSession,
    service: NotifServiceDep,
    user: AuthUser,
):
    await service.delete_all(session, user.id)
