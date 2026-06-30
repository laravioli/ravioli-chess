from fastapi import APIRouter
from pydantic import UUID4

from app.auth.deps import UserOrAnon

router = APIRouter(prefix="/mm", tags=["matchmaking"])


@router.post("/ai")
async def match_ai(current_user: UserOrAnon, level: int):
    pass


@router.post("/friend")
async def match_friend(current_user: UserOrAnon, user: UUID4 | None = None):
    pass


@router.post("/random")
async def match_random(current_user: UserOrAnon):
    pass
