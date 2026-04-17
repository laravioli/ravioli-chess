from fastapi import APIRouter
from fastapi_pagination import resolve_params

from app.api.schemas import SmallPage
from app.auth.deps import CurrentUser

from .deps import NotifDeps
from .schemas import Notification

router = APIRouter(prefix="/notif", tags=["notifications"])


@router.get("", response_model=SmallPage[Notification])
async def list_notif(
    service: NotifDeps,
    user: CurrentUser,
):
    params = resolve_params()
    notif = await service.get_notifications(user.id, params)

    return notif
