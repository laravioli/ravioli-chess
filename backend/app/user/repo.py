from uuid import UUID

from msgspec import convert
from sqlalchemy import delete, insert
from sqlalchemy.ext.asyncio import AsyncConnection

from app.auth.security import generate_password_hash
from app.exceptions import DBNotFound
from ravioli_core.db.models import Friendship as _sa_Friendship
from ravioli_core.db.models import SA_Preference, SA_User
from ravioli_core.db.models.pref import Board, PieceSet
from ravioli_core.db.queries import UserQueries
from ravioli_core.db.utils import PGConnection, transaction

from .schemas import UserCreate
from .structs import User, UserFull


class UserRepo:
    async def by_id(self, conn: PGConnection, user_id: UUID):
        user = await conn.fetchrow(UserQueries.by_id, user_id)
        return convert(user, type=User) if user else None

    async def by_username(self, conn: PGConnection, username: str):
        user = await conn.fetchrow(UserQueries.by_username, username)
        return convert(user, type=User) if user else None

    async def by_id_full(self, conn: PGConnection, user_id: UUID):
        user = await conn.fetchrow(UserQueries.by_id_full, user_id)
        return convert(user, type=UserFull) if user else None

    async def by_username_full(self, conn: PGConnection, username: str):
        user = await conn.fetchrow(UserQueries.by_username_full, username)
        return convert(user, type=UserFull) if user else None

    async def by_username_profile(
        self,
        conn: PGConnection,
        current_user: User,
        username: str,
    ) -> tuple[SA_User, _sa_Friendship | None] | None:
        return await conn.fetchrow(UserQueries.by_username_profile, current_user.id, username)

    async def search(self, conn: PGConnection, search_query: str, limit: int):
        return await conn.fetch(UserQueries.search, search_query, limit)

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
