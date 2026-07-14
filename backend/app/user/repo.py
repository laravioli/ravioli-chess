from typing import Any
from uuid import UUID

from sqlalchemy import ColumnElement, Select, and_, bindparam, delete, insert, select
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncSession

from app.auth.security import generate_password_hash
from app.exceptions import DBNotFound
from app.social.repo import SocialRepo
from ravioli_core.db.models import Friendship as _sa_Friendship
from ravioli_core.db.models import SA_Preference, SA_User
from ravioli_core.db.models.pref import Board, PieceSet
from ravioli_core.db.utils import transaction
from ravioli_core.structs import CoreStruct

from .schemas import UserCreate
from .user import User, UserWithPref


def stmt_by(condition: ColumnElement[bool]):
    return select(SA_User).where(condition)


def stmt_with_pref(condition: ColumnElement):
    return select(SA_User, SA_Preference).outerjoin(SA_Preference).where(condition)


STMT_ID = stmt_by(SA_User.id == bindparam("user_id"))
STMT_ID_PREF = stmt_with_pref(SA_User.id == bindparam("user_id"))
STMT_USERNAME = stmt_by(SA_User.username == bindparam("user_username"))
STMT_USERNAME_PREF = stmt_with_pref(SA_User.username == bindparam("user_username"))


class UserRepo:
    def __init__(self, social_repo: SocialRepo):
        self._social_repo = social_repo

    async def _fetch_one[T: CoreStruct](
        self, conn: AsyncConnection, statement: Select, parameters: dict[str, Any], model: type[T]
    ) -> T:
        row = await conn.execute(statement, parameters)
        return model.from_mapping(row.mappings().one())

    async def by_id(self, conn: AsyncConnection, user_id: UUID):
        return await self._fetch_one(conn, STMT_ID, {"user_id": user_id}, User)

    async def by_id_with_pref(self, conn: AsyncConnection, user_id: UUID):
        return await self._fetch_one(conn, STMT_ID_PREF, {"user_id": user_id}, UserWithPref)

    async def by_username(self, conn: AsyncConnection, username: str):
        return await self._fetch_one(conn, STMT_USERNAME, {"user_username": username}, User)

    async def by_username_with_pref(self, conn: AsyncConnection, username: str):
        return await self._fetch_one(
            conn, STMT_USERNAME_PREF, {"user_username": username}, UserWithPref
        )

    async def by_username_with_friendship(
        self,
        session: AsyncSession,
        current_user: User,
        username: str,
    ) -> tuple[SA_User, _sa_Friendship | None] | None:
        stmt = (
            select(SA_User, _sa_Friendship)
            .outerjoin(
                _sa_Friendship,
                and_(*self._social_repo.friendship_criteria(current_user.id, SA_User.id)),
            )
            .where(SA_User.username == username)
        )
        result = await session.execute(stmt)
        return result.first()  # type: ignore

    async def search(self, session: AsyncConnection, search_query: str, limit: int):
        stmt = (
            select(SA_User.id, SA_User.username)
            .where(SA_User.username.like(f"{search_query}%"))
            .order_by(SA_User.username)
            .limit(limit)
        )

        result = await session.execute(stmt)
        return result.all()

    async def create(
        self,
        conn: AsyncConnection,
        data: UserCreate,
    ):
        async with transaction(conn, error_detail="This username or email already exists"):
            stmt = (
                insert(SA_User)
                .values(
                    username=data.username,
                    email=data.email,
                    hashed_password=generate_password_hash(data.password.get_secret_value()),
                )
                .returning(SA_User.id, SA_User.username, SA_User.joined_at)
            )
            user = (await conn.execute(stmt)).one()

            pref_stmt = insert(SA_Preference).values(
                board=Board.BLUE, pieceset=PieceSet.BASE, user_id=user.id
            )
            await conn.execute(pref_stmt)
            return user

    async def delete(
        self,
        conn: AsyncConnection,
        user_id: UUID,
    ):
        async with transaction(conn):
            stmt = delete(SA_User).where(SA_User.id == user_id)
            result = await conn.execute(stmt)

            if result.rowcount == 0:  # type: ignore
                raise DBNotFound(detail="User does not exist")
