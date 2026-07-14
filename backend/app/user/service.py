from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncConnection, AsyncSession

from app.notif.service import NotifService
from app.pref import Preference
from app.user.repo import UserRepo
from app.websocket.pubsub import Users

from .schemas import FriendShipProfile, UserCreate, UserProfile, UserSearch, UserWithPref
from .user import User


class UserService:
    def __init__(self, repo: UserRepo, users: Users, notif: NotifService):
        self.user_repo = repo
        self._users = users
        self._notif = notif

    async def create(self, conn: AsyncConnection, data: UserCreate):
        row = await self.user_repo.create(conn, data)
        return UserWithPref(**row._mapping, preference=Preference())

    async def profile(self, conn: AsyncConnection, username: str):
        user = await self.user_repo.by_username(conn, username)
        if user:
            online = await self._users.is_online(str(user.id))
            return UserProfile(
                id=user.id, username=user.username, joined_at=user.joined_at, online=online
            )

    async def profile_with_friendship(
        self, session: AsyncSession, current_user: User, username: str
    ):

        result = await self.user_repo.by_username_with_friendship(session, current_user, username)
        if not result:
            return

        user, friendship = result

        return UserProfile(
            id=user.id,
            username=user.username,
            friendship=FriendShipProfile(
                is_sender=friendship.sender_id == current_user.id, status=friendship.status
            )
            if friendship
            else None,
            joined_at=user.joined_at,
            online=await self._users.is_online(str(user.id)),
        )

    async def search(self, conn: AsyncConnection, search_query: str, limit: int):

        rows = await self.user_repo.search(conn, search_query, limit)
        online_status = await self._users.are_online([row.id for row in rows])

        return [
            UserSearch(
                id=row.id,
                username=row.username,
                online=online,
            )
            for row, online in zip(rows, online_status, strict=True)
        ]

    async def delete(self, conn: AsyncConnection, user_id: UUID):
        await self.user_repo.delete(conn, user_id)

    @staticmethod
    def make(*, repo: UserRepo, users: Users, notif: NotifService):
        return UserService(repo, users, notif)
