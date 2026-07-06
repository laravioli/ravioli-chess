from typing import Unpack
from uuid import UUID

from sqlalchemy import and_, delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.auth.security import generate_password_hash
from app.exceptions import DBNotFound
from app.notif.service import NotifService
from app.social.db import friendship_criteria
from app.websocket.pubsub import Users
from ravioli_core.db.models import Friendship, Preference, User
from ravioli_core.db.utils import transaction

from .schemas import UserCreate, UserFilter, UserSearch


class UserService:
    def __init__(self, users: Users, notif: NotifService):
        self._users = users
        self._notif = notif

    async def create(self, session: AsyncSession, data: UserCreate):
        async with transaction(session, error_detail="This username or email already exists"):
            new_user = User(
                username=data.username,
                email=data.email,
                hashed_password=generate_password_hash(data.password.get_secret_value()),
                preference=Preference(),
            )

            session.add(new_user)

        return new_user

    async def retrieve(self, session: AsyncSession, username: str, **kwargs: Unpack[UserFilter]):
        options = []
        if kwargs.get("with_pref"):
            options.append(joinedload(User.preference))
        stmt = select(User).where(User.username == username).options(*options)
        user = await session.scalar(stmt)

        if user and kwargs.get("with_online"):
            user.online = await self._users.is_online(str(user.id))  # type: ignore

        return user

    async def retrieve_with_friendship(
        self, session: AsyncSession, current_user: User, username: str
    ):
        stmt = (
            select(User, Friendship)
            .outerjoin(
                Friendship,
                and_(*friendship_criteria(current_user.id, User.id)),
            )
            .where(User.username == username)
        )

        result = await session.execute(stmt)
        row = result.first()

        if row is None:
            return None

        user, friendship = row
        if user:
            if friendship:
                friendship.is_sender = friendship.sender_id == current_user.id
            user.friendship = friendship
            user.online = await self._users.is_online(str(user.id))

        return user

    async def search(self, session: AsyncSession, search_query: str, limit: int):
        stmt = (
            select(User.id, User.username)
            .where(User.username.like(f"{search_query}%"))
            .order_by(User.username)
            .limit(limit)
        )
        result = await session.execute(stmt)
        rows = result.all()

        online_status = await self._users.are_online([row.id for row in rows])

        return [
            UserSearch(
                id=row.id,
                username=row.username,
                online=online,
            )
            for row, online in zip(rows, online_status, strict=True)
        ]

    async def delete(self, session: AsyncSession, id: UUID):
        stmt = delete(User).where(User.id == id)
        result = await session.execute(stmt)

        if result.rowcount == 0:  # type: ignore
            raise DBNotFound(detail="User does not exist")

        await session.commit()

    async def login(self, session: AsyncSession, user: User):
        try:
            user.unread_count = await self._notif.get_unread_count(session, user.id)  # type: ignore
        except Exception:
            user.unread_count = 0  # type: ignore
        return user

    @staticmethod
    def make(*, users: Users, notif: NotifService):
        return UserService(users, notif)
