from uuid import UUID

from app.notif.service import NotifService
from app.pref.schemas import Preference
from app.user.repo import UserRepo
from app.websocket.pubsub import Users
from ravioli_core.db.types import PGConnection

from .schemas import FriendShipProfile, UserCreate, UserProfile, UserSearch, UserWithPref
from .structs import User


class UserService:
    def __init__(self, repo: UserRepo, users: Users, notif: NotifService):
        self.repo = repo
        self._users = users
        self._notif = notif

    async def create(self, conn: PGConnection, data: UserCreate):
        id = await self.repo.create(conn, data)
        return UserWithPref(**row._mapping, preference=Preference())

    async def profile(self, conn: PGConnection, username: str):
        user = await self.repo.by_username(conn, username)
        if user:
            online = await self._users.is_online(str(user.id))
            return UserProfile(
                id=user.id,
                username=user.username,
                joined_at=user.joined_at,
                online=online,
            )

    async def profile_with_friendship(
        self,
        conn: PGConnection,
        current_user: User,
        username: str,
    ):

        result = await self.repo.by_username_profile(conn, current_user, username)
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

    async def search(self, conn: PGConnection, search_query: str, limit: int):

        rows = await self.repo.search(conn, search_query, limit)
        online_status = await self._users.are_online([row.id for row in rows])

        return [
            UserSearch(
                id=row.id,
                username=row.username,
                online=online,
            )
            for row, online in zip(rows, online_status, strict=True)
        ]

    async def delete(self, conn: PGConnection, user_id: UUID):
        await self.repo.delete(conn, user_id)

    @staticmethod
    def make(*, repo: UserRepo, users: Users, notif: NotifService):
        return UserService(repo, users, notif)
