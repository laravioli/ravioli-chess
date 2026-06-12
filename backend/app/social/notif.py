from uuid import UUID

from app.notif.background import BackgroundNotif
from app.notif.service import NotifService


class SocialNotif:
    def __init__(self, notif: NotifService):
        self.notif = notif

    async def create(
        self,
        bg: BackgroundNotif,
        receiver_id: UUID,
    ):
        await self.notif.cache.incrby(f"{receiver_id}", 1)
        self.notif.notify_one(bg, receiver_id)

    async def accept(
        self,
        bg: BackgroundNotif,
        sender_id: UUID,
        receiver_id: UUID,
    ):
        await self.notif.cache.incrby_many({f"{sender_id}": 1, f"{receiver_id}": -1})
        self.notif.notify_many(bg, [sender_id, receiver_id])

    async def delete(
        self,
        bg: BackgroundNotif,
        receiver_id: UUID,
    ):
        await self.notif.cache.incrby(f"{receiver_id}", -1)
        self.notif.notify_one(bg, receiver_id)

    async def delete_friend(
        self,
        bg: BackgroundNotif,
        current_user_id: UUID,
        target_id: UUID,
    ):
        users = [current_user_id, target_id]
        await self.notif.cache.invalidate_count(users)
        self.notif.notify_many(bg, users)
