import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.notif.background import BackgroundNotif
from app.notif.service import NotifService
from ravioli_core.db.models.social import FriendshipStatus

from .db import SocialDB
from .notif import SocialNotif

logger = logging.getLogger(__name__)


class SocialService:
    def __init__(self, db: SocialDB, notif: SocialNotif):
        self.db = db
        self.notif = notif

    async def create_request(
        self,
        bg: BackgroundNotif,
        session: AsyncSession,
        sender_id: uuid.UUID,
        receiver_id: uuid.UUID,
    ):
        await self.db.create_request(session, sender_id, receiver_id)
        await self.notif.create(bg, receiver_id)

    async def accept_request(
        self,
        bg: BackgroundNotif,
        session: AsyncSession,
        sender_id: uuid.UUID,
        receiver_id: uuid.UUID,
    ):
        await self.db.accept_request(session, sender_id, receiver_id)
        await self.notif.accept(bg, sender_id, receiver_id)

    async def delete_request(
        self,
        bg: BackgroundNotif,
        session: AsyncSession,
        sender_id: uuid.UUID,
        receiver_id: uuid.UUID,
    ):

        await self.db.delete_request(session, sender_id, receiver_id)
        await self.notif.delete(bg, receiver_id)

    async def list_friendship(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        status: FriendshipStatus,
    ):
        return await self.db.list_friendship(session, user_id, status)

    async def delete_friend(
        self,
        bg: BackgroundNotif,
        session: AsyncSession,
        current_user_id: uuid.UUID,
        target_id: uuid.UUID,
    ):
        await self.db.delete_friend(session, current_user_id, target_id)
        await self.notif.delete_friend(bg, current_user_id, target_id)


def make_social_service(notif: NotifService):
    return SocialService(db=SocialDB(), notif=SocialNotif(notif=notif))
