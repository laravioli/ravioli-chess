from fastapi import APIRouter

from app.auth.deps import CurrentUser
from app.deps import DbSession

from .schemas import Notification
from .service import get_notifications

router = APIRouter(prefix="/notif", tags=["notifications"])


@router.get("", response_model=list[Notification])
async def list_notif(session: DbSession, user: CurrentUser):
    return await get_notifications(session, user.id)
