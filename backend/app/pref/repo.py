from typing import Any

from app.user import User
from ravioli_core.db.types import PGConnection

from .schemas import PreferenceUpdate


class PrefRepo:
    async def update(self, conn: PGConnection, user: User, data: PreferenceUpdate):
        set_clause: list[str] = []
        params: list[Any] = [user.id]
        for i, (col, val) in enumerate(data.to_dict().items(), start=2):
            set_clause.append(f"{col} = ${i}")
            params.append(val)

        stmt = f"""
        UPDATE user_preference up
        SET {", ".join(set_clause)}
        WHERE up.user_id = $1
        """

        await conn.execute(stmt, *params)
