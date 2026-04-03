from fastapi import APIRouter

from app.auth.deps import CurrentUser
from app.deps import DbSession

from .deps import NotifCache
from .schemas import Notification
from .service import get_notifications

router = APIRouter(prefix="/notif", tags=["notifications"])


@router.get("", response_model=list[Notification])
async def list_notif(cache: NotifCache, session: DbSession, user: CurrentUser):
    notif = await get_notifications(cache, session, user.id)
    return notif
