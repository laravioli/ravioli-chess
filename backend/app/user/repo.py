from typing import Literal, overload
from uuid import UUID

from sqlalchemy import ColumnElement, and_, bindparam, delete, insert, select
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncSession

from app.auth.security import generate_password_hash
from app.exceptions import DBNotFound
from app.social.repo import SocialRepo
from ravioli_core.db.models import Friendship as _sa_Friendship
from ravioli_core.db.models import Preference as _sa_Preference
from ravioli_core.db.models import User as _sa_User
from ravioli_core.db.models.pref import Board, PieceSet
from ravioli_core.db.utils import transaction

from .schemas import UserCreate
from .user import User, UserWithPref


def stmt_by(condition: ColumnElement[bool]):
    return select(_sa_User).where(condition)


def stmt_with_pref(condition: ColumnElement):
    return select(_sa_User, _sa_Preference).outerjoin(_sa_Preference).where(condition)


_STMT_ID = stmt_by(_sa_User.id == bindparam("user_id"))
_STMT_USERNAME = stmt_by(_sa_User.username == bindparam("user_username"))
_STMT_ID_PREF = stmt_with_pref(_sa_User.id == bindparam("user_id"))
_STMT_USERNAME_PREF = stmt_with_pref(_sa_User.username == bindparam("user_username"))


class UserRepo:
    def __init__(self, social_repo: SocialRepo):
        self._social_repo = social_repo

    @overload
    async def by_id(self, conn, user_id, load_pref: Literal[True]) -> UserWithPref: ...
    @overload
    async def by_id(self, conn, user_id, load_pref: Literal[False]) -> User: ...
    async def by_id(
        self,
        conn: AsyncConnection,
        user_id: UUID,
        load_pref=False,
    ):
        stmt = _STMT_ID_PREF if load_pref else _STMT_ID
        row = (await conn.execute(stmt, {"user_id": user_id})).mappings().one()
        return UserWithPref.from_row(row) if load_pref else User.from_row(row)

    @overload
    async def by_username(self, conn, username, load_pref: bool = True) -> UserWithPref: ...
    @overload
    async def by_username(self, conn, username, load_pref: bool = False) -> User: ...
    async def by_username(
        self,
        conn: AsyncConnection,
        username: str,
        load_pref=False,
    ):
        stmt = _STMT_USERNAME_PREF if load_pref else _STMT_USERNAME
        row = (await conn.execute(stmt, {"user_username": username})).mappings().one()
        return UserWithPref.from_row(row) if load_pref else User.from_row(row)

    async def by_username_with_friendship(
        self,
        session: AsyncSession,
        current_user: User,
        username: str,
    ) -> tuple[_sa_User, _sa_Friendship | None] | None:
        stmt = (
            select(_sa_User, _sa_Friendship)
            .outerjoin(
                _sa_Friendship,
                and_(*self._social_repo.friendship_criteria(current_user.id, _sa_User.id)),
            )
            .where(_sa_User.username == username)
        )
        result = await session.execute(stmt)
        return result.first()  # type: ignore

    async def search(self, session: AsyncConnection, search_query: str, limit: int):
        stmt = (
            select(_sa_User.id, _sa_User.username)
            .where(_sa_User.username.like(f"{search_query}%"))
            .order_by(_sa_User.username)
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
                insert(_sa_User)
                .values(
                    username=data.username,
                    email=data.email,
                    hashed_password=generate_password_hash(data.password.get_secret_value()),
                )
                .returning(_sa_User.id, _sa_User.username, _sa_User.joined_at)
            )
            user = (await conn.execute(stmt)).one()

            pref_stmt = insert(_sa_Preference).values(
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
            stmt = delete(User).where(_sa_User.id == user_id)
            result = await conn.execute(stmt)

            if result.rowcount == 0:  # type: ignore
                raise DBNotFound(detail="User does not exist")
