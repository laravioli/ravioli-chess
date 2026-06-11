from uuid import UUID

from fastapi import BackgroundTasks
from msgspec import Raw

from ravioli_core.db.models import Notification
from ravioli_core.ipc.channels import WsChan
from ravioli_core.ipc.process.out import TellUser
from ravioli_core.pubsub import Publisher

from .schemas import notification_ta


class BackgroundNotif:
    def __init__(
        self,
        pub: Publisher,
        background_tasks: BackgroundTasks,
    ):
        self.pub = pub
        self.background_tasks = background_tasks

    def tell_user(self, user_id: UUID, notifications: list[Notification]):
        self.background_tasks.add_task(self.publish_to_user, user_id, notifications)

    async def publish_to_user(self, user_id: UUID, notifications: list[Notification]):
        raw = notification_ta.dump_json(notification_ta.validate_python(notifications))
        await self.pub.publish(WsChan.users(user_id), TellUser(type="notifications", data=Raw(raw)))
