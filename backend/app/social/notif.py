from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.notif.background import BackgroundNotif
from app.notif.service import NotifService


class SocialNotif:
    def __init__(self, notif: NotifService):
        self.notif = notif

    async def create(
        self,
        bg: BackgroundNotif,
        session: AsyncSession,
        receiver_id: UUID,
    ):
        await self.notif.cache.incrby(f"{receiver_id}", 1)
        await self.notif.notify_one(bg, session, receiver_id)

    async def accept(
        self,
        bg: BackgroundNotif,
        session: AsyncSession,
        sender_id: UUID,
        receiver_id: UUID,
    ):
        await self.notif.cache.incrby_many({f"{sender_id}": 1, f"{receiver_id}": -1})
        await self.notif.notify_many(bg, session, [sender_id, receiver_id])

    async def delete(
        self,
        bg: BackgroundNotif,
        session: AsyncSession,
        receiver_id: UUID,
    ):
        await self.notif.cache.incrby(f"{receiver_id}", -1)
        await self.notif.notify_one(bg, session, receiver_id)

    async def delete_friend(
        self,
        bg: BackgroundNotif,
        session: AsyncSession,
        current_user_id: UUID,
        target_id: UUID,
    ):
        users = [current_user_id, target_id]
        await self.notif.cache.invalidate_count(users)
        await self.notif.notify_many(bg, session, users)
