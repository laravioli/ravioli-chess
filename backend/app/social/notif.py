from uuid import UUID

from app.background import Background
from app.notif.service import NotifService


class SocialNotif:
    def __init__(self, notif: NotifService):
        self.notif = notif

    async def create(
        self,
        bg: Background,
        receiver_id: UUID,
    ):
        await self.notif.cache.incrby(f"{receiver_id}", 1)
        self.notif.notify_one(bg, receiver_id)

    async def accept(
        self,
        bg: Background,
        sender_id: UUID,
        receiver_id: UUID,
    ):
        await self.notif.cache.incrby_many({f"{sender_id}": 1, f"{receiver_id}": -1})
        self.notif.notify_many(bg, [sender_id, receiver_id])

    async def delete(
        self,
        bg: Background,
        receiver_id: UUID,
    ):
        await self.notif.cache.incrby(f"{receiver_id}", -1)
        self.notif.notify_one(bg, receiver_id)

    async def delete_friend(
        self,
        bg: Background,
        current_user_id: UUID,
        target_id: UUID,
    ):
        users = [current_user_id, target_id]
        await self.notif.cache.invalidate_count(users)
        self.notif.notify_many(bg, users)
