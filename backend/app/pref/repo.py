from typing import Any

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncConnection

from app.user import User
from ravioli_core.db.models import SA_Preference
from ravioli_core.db.utils import transaction


class PrefRepo:
    async def update(self, conn: AsyncConnection, user: User, data: dict[str, Any]):
        async with transaction(conn):
            stmt = update(SA_Preference).where(SA_Preference.user_id == user.id).values(data)
            await conn.execute(stmt)
