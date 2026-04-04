from uuid import UUID

from msgspec import Raw

from app.background import Publish
from app.deps import LocalSession
from core.ipc.channels import UserChan
from core.ipc.process.out import TellUser

from .deps import NotifCache
from .schemas import notification_adapter
from .service import db_notifications


async def update_notif_cache(cache: NotifCache, user_id: UUID):
    async with LocalSession() as session:
        notifications = await db_notifications(session, user_id)
    raw_notifs = notification_adapter.dump_json(notification_adapter.validate_python(notifications))
    await cache.set(f"{user_id}", raw_notifs)
    return raw_notifs


# note: a cool logic -> if user is offline -> clear cache -> else refresh_cache and publish
def refresh_cache_and_push_notifications(
    cache: NotifCache,
    publish: Publish,
    user_id: UUID,
):
    async def coro():
        raw_data = await update_notif_cache(cache, user_id)
        return TellUser(data=Raw(raw_data))

    publish(UserChan(str(user_id)), coro)
