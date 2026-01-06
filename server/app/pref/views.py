from fastapi import APIRouter, status

from app.auth.deps import UserOrAnon
from app.db.session import DbSession

from .schemas import PreferenceUpdate
from .service import update_user_pref

router = APIRouter(prefix="/pref", tags=["preference"])


@router.get("")
async def get_pref():
    pass


@router.post("", status_code=status.HTTP_204_NO_CONTENT)
async def update_pref(session: DbSession, user: UserOrAnon, pref: PreferenceUpdate):
    if user:
        await update_user_pref(session, user, pref)
