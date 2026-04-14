from fastapi import APIRouter
from fastapi_pagination import Page, Params, resolve_params

from app.auth.deps import CurrentUser
from app.deps import DbSession

from .deps import NotifCache
from .schemas import Notification
from .service import get_notifications

router = APIRouter(prefix="/notif", tags=["notifications"])


@router.get("", response_model=Page[Notification])
async def list_notif(cache: NotifCache, session: DbSession, user: CurrentUser):
    params: Params = resolve_params()
    notif = await get_notifications(cache, session, user.id, params)
    return notif
