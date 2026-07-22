from uuid import UUID

from msgspec import convert
from sqlalchemy import delete, insert
from sqlalchemy.ext.asyncio import AsyncConnection

from app.auth.security import generate_password_hash
from app.exceptions import DBNotFound
from ravioli_core.db.models import Friendship as _sa_Friendship
from ravioli_core.db.models import SA_Preference, SA_User
from ravioli_core.db.models.pref import Board, PieceSet
from ravioli_core.db.sql_loader import sql_from_file
from ravioli_core.db.utils import PGConnection, transaction

from .schemas import UserCreate
from .structs import User, UserWithPref

QUERIES = sql_from_file("./app/queries/user.sql")


class UserRepo:
    async def by_id(self, conn: PGConnection, user_id: UUID):
        user = await conn.fetchrow(QUERIES.by_id, user_id)  # type: ignore
        if user:
            return convert(user, type=User)

    async def by_username(self, conn: PGConnection, username: str):
        user = await conn.fetchrow(QUERIES.by_username, username)  # type: ignore
        if user:
            return convert(user, type=User)

    async def by_id_with_pref(self, conn: PGConnection, user_id: UUID):
        user = await conn.fetchrow(QUERIES.by_id_with_pref, user_id)  # type: ignore
        if user:
            return convert(user, type=UserWithPref)

    async def by_username_with_pref(self, conn: PGConnection, username: str):
        user = await conn.fetchrow(QUERIES.by_username_with_pref, username)  # type: ignore
        if user:
            return convert(user, type=UserWithPref)

    async def by_username_with_friendship(
        self,
        conn: PGConnection,
        current_user: User,
        username: str,
    ) -> tuple[SA_User, _sa_Friendship | None] | None:
        return await conn.fetchrow(QUERIES.by_username_with_friendship, current_user.id, username)  # type: ignore

    async def search(self, conn: PGConnection, search_query: str, limit: int):
        return await conn.fetch(QUERIES.search, search_query, limit)  # type: ignore

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
