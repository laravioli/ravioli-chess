from uuid import UUID

from fastapi import BackgroundTasks
from msgspec import Raw

from ravioli_core.db.models import Notification
from ravioli_core.ipc.channels import WsUserChan
from ravioli_core.ipc.process.out import TellUser
from ravioli_core.pubsub import Broadcast

from .schemas import notification_adapter


class BackgroundNotif:
    def __init__(
        self,
        broadcast: Broadcast,
        background_tasks: BackgroundTasks,
    ):
        self.broadcast = broadcast
        self.background_tasks = background_tasks

    def tell_user(self, user_id: UUID, notifications: list[Notification]):
        self.background_tasks.add_task(self.publish_to_user, user_id, notifications)

    async def publish_to_user(self, user_id: UUID, notifications: list[Notification]):
        raw = notification_adapter.dump_json(notification_adapter.validate_python(notifications))
        await self.broadcast.publish(
            WsUserChan(str(user_id)), TellUser(type="notifications", data=Raw(raw))
        )
