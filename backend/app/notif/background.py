from typing import Annotated
from uuid import UUID

from fastapi import BackgroundTasks, Depends
from msgspec import Raw
from ravioli_core.db.models import Notification
from ravioli_core.ipc.channels import UserChan
from ravioli_core.ipc.process.out import TellUser

from app.deps import BroadCastClient

from .schemas import notification_adapter


class BackgroundNotif:
    def __init__(
        self,
        broadcast: BroadCastClient,
        background_tasks: BackgroundTasks,
    ):
        self.broadcast = broadcast
        self.background_tasks = background_tasks

    def tell_user(self, user_id: UUID, notifications: list[Notification]):
        self.background_tasks.add_task(self.publish_to_user, user_id, notifications)

    async def publish_to_user(self, user_id: UUID, notifications: list[Notification]):
        raw = notification_adapter.dump_json(notification_adapter.validate_python(notifications))
        await self.broadcast.publish(
            UserChan(str(user_id)), TellUser(type="notifications", data=Raw(raw))
        )


async def get_notifier(broadcast: BroadCastClient, background_tasks: BackgroundTasks):
    return BackgroundNotif(broadcast, background_tasks)


type Notifier = Annotated[BackgroundNotif, Depends(get_notifier)]
