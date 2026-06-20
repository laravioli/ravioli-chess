from typing import NewType
from uuid import UUID

UserId = NewType("UserId", UUID)
GameId = NewType("GameId", str)
