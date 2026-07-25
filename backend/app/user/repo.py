from datetime import datetime
from typing import TypedDict, cast
from uuid import UUID

from asyncpg import Record
from msgspec import convert

from app.auth.security import generate_password_hash
from app.social.structs import Friendship
from ravioli_core.db.models.pref import Board, PieceSet
from ravioli_core.db.queries import UserQueries
from ravioli_core.db.types import PGConnection

from .schemas import UserCreate
from .structs import User, UserFull


class UserRepo:
    @staticmethod
    async def by_id(
        conn: PGConnection,
        user_id: UUID,
    ):
        user = await conn.fetchrow(UserQueries.by_id, user_id)
        return convert(user, type=User) if user else None

    async def by_username(
        self,
        conn: PGConnection,
        username: str,
    ):
        user = await conn.fetchrow(UserQueries.by_username, username)
        return convert(user, type=User) if user else None

    async def by_id_full(
        self,
        conn: PGConnection,
        user_id: UUID,
    ):
        user = await conn.fetchrow(UserQueries.by_id_full, user_id)
        return convert(user, type=UserFull) if user else None

    async def by_username_full(
        self,
        conn: PGConnection,
        username: str,
    ):
        user = await conn.fetchrow(UserQueries.by_username_full, username)
        return convert(user, type=UserFull) if user else None

    async def by_username_profile(
        self,
        conn: PGConnection,
        current_user: User,
        username: str,
    ):
        row = await conn.fetchrow(UserQueries.by_username_profile, current_user.id, username)
        if row is not None:
            return convert(row["user"], type=User), convert(row["friendship"], type=Friendship)

    async def search(
        self,
        conn: PGConnection,
        search_query: str,
        limit: int,
    ) -> list[Record]:
        return await conn.fetch(UserQueries.search, search_query, limit)

    async def create(
        self,
        conn: PGConnection,
        data: UserCreate,
    ):
        row = await conn.fetchrow(
            UserQueries.insert,
            data.username,
            data.email,
            generate_password_hash(data.password.get_secret_value()),
            False,
            Board.BLUE.value,
            PieceSet.BASE.value,
        )
        return cast(UserCreateRow, row)

    async def delete(
        self,
        conn: PGConnection,
        user_id: UUID,
    ):
        await conn.execute(UserQueries.delete, user_id)


class UserCreateRow(TypedDict):
    id: UUID
    username: str
    joined_at: datetime
