from uuid import UUID

from msgspec import Raw

from app.background import Publish
from app.deps import LocalSession
from core.ipc.channels import UserChan
from core.ipc.process.out import TellUser

from .schemas import notification_adapter
from .service import get_notifications


def publish_notifications(publish: Publish, user_id: UUID):
    async def coro():
        async with LocalSession() as session:
            notifications = await get_notifications(session, user_id)
        raw_data = Raw(
            notification_adapter.dump_json(notification_adapter.validate_python(notifications))
        )
        return TellUser(data=raw_data)

    publish(UserChan(str(user_id)), coro)
