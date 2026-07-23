from uuid import UUID

from msgspec import convert

from app.auth.security import generate_password_hash
from ravioli_core.db.models.pref import Board, PieceSet
from ravioli_core.db.queries import PrefQueries, UserQueries
from ravioli_core.db.types import PGConnection

from .schemas import UserCreate
from .structs import User, UserFull


class UserRepo:
    async def by_id(
        self,
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
        return await conn.fetchrow(UserQueries.by_username_profile, current_user.id, username)

    async def search(
        self,
        conn: PGConnection,
        search_query: str,
        limit: int,
    ):
        return await conn.fetch(UserQueries.search, search_query, limit)

    async def create(
        self,
        conn: PGConnection,
        data: UserCreate,
    ):
        async with conn.transaction():
            id = await conn.fetchval(
                UserQueries.insert,
                data.username,
                data.email,
                generate_password_hash(data.password.get_secret_value()),
            )

            await conn.execute(
                PrefQueries.insert,
                (Board.BLUE.value, PieceSet.BASE.value, id),  # type: ignore
            )

        return id

    async def delete(
        self,
        conn: PGConnection,
        user_id: UUID,
    ):
        async with conn.transaction():
            await conn.execute(UserQueries.delete, user_id)
