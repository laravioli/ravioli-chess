import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncConnection, AsyncSession

from app.background import Background
from app.notif.service import NotifService
from ravioli_core.db.models.social import FriendshipStatus

from .notif import SocialNotif
from .repo import SocialRepo

logger = logging.getLogger(__name__)


class SocialService:
    def __init__(self, repo: SocialRepo, notif: SocialNotif):
        self._repo = repo
        self._notif = notif

    async def create_request(
        self,
        bg: Background,
        session: AsyncSession,
        sender_id: uuid.UUID,
        receiver_id: uuid.UUID,
    ):
        await self._repo.create_request(session, sender_id, receiver_id)
        await self._notif.create(bg, receiver_id)

    async def accept_request(
        self,
        bg: Background,
        session: AsyncSession,
        sender_id: uuid.UUID,
        receiver_id: uuid.UUID,
    ):
        await self._repo.accept_request(session, sender_id, receiver_id)
        await self._notif.accept(bg, sender_id, receiver_id)

    async def delete_request(
        self,
        bg: Background,
        session: AsyncSession,
        sender_id: uuid.UUID,
        receiver_id: uuid.UUID,
    ):

        await self._repo.delete_request(session, sender_id, receiver_id)
        await self._notif.delete(bg, receiver_id)

    async def list_friendship(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        status: FriendshipStatus,
    ):
        return await self._repo.list_friendship(session, user_id, status)

    async def delete_friend(
        self,
        bg: Background,
        conn: AsyncConnection,
        current_user_id: uuid.UUID,
        target_id: uuid.UUID,
    ):
        await self._repo.delete_friend(conn, current_user_id, target_id)
        await self._notif.delete_friend(bg, current_user_id, target_id)

    @staticmethod
    def make(*, repo: SocialRepo, notif: NotifService):
        return SocialService(repo=repo, notif=SocialNotif(notif=notif))
