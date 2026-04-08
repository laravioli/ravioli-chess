from typing import Annotated
from uuid import UUID

from fastapi import BackgroundTasks, Depends
from msgspec import Raw

from app.deps import BroadCastClient, LocalSession
from core.ipc.channels import UserChan
from core.ipc.process.out import TellUser

from .cache import NotifCache
from .schemas import notification_adapter
from .service import db_notifications


class BackgroundNotifier:
    def __init__(
        self,
        broadcast: BroadCastClient,
        background_tasks: BackgroundTasks,
        cache: NotifCache,
    ):
        self.broadcast = broadcast
        self.background_tasks = background_tasks
        self.cache = cache

    def add_background_task(self, user_id: UUID):
        self.background_tasks.add_task(self.refresh_cache_and_publish, user_id)

    async def refresh_cache_and_publish(
        self,
        user_id: UUID,
    ):
        raw_data = await self.refresh_cache_notif(user_id)
        await self.broadcast.publish(UserChan(str(user_id)), TellUser(data=Raw(raw_data)))

    async def refresh_cache_notif(self, user_id: UUID):
        async with LocalSession() as session:
            notifications = await db_notifications(session, user_id)
        raw_notifs = notification_adapter.dump_json(
            notification_adapter.validate_python(notifications)
        )
        await self.cache.set(f"{user_id}", raw_notifs)
        return raw_notifs


async def get_background_notifer(
    broadcast: BroadCastClient, background_tasks: BackgroundTasks, cache: NotifCache
):
    return BackgroundNotifier(broadcast, background_tasks, cache)


type Notifier = Annotated[BackgroundNotifier, Depends(get_background_notifer)]
