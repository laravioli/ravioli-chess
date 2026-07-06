from typing import NewType
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncConnection, AsyncSession

UserId = NewType("UserId", UUID)
GameId = NewType("GameId", str)

type _SA_Connection = AsyncConnection | AsyncSession
