from fastapi import APIRouter

from app.auth.deps import current_user

router = APIRouter(prefix="/social", tags=["social"], dependencies=[current_user])


@router.post("/add/{username}")
async def add_friend(username: str):
    pass
