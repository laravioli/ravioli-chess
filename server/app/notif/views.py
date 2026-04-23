from fastapi import APIRouter, Response
from fastapi_pagination import resolve_params

from app.auth.deps import CurrentUser

from .deps import NotifDeps
from .schemas import Notification, NotifPagination

router = APIRouter(prefix="/notif", tags=["notifications"])


@router.get("", response_model=NotifPagination[Notification])
async def list_notif(
    service: NotifDeps,
    user: CurrentUser,
):
    params = resolve_params()
    notif = await service.get_notifications(user.id, params)
    if isinstance(notif, bytes):
        return Response(content=notif, media_type="application/json")

    return notif
