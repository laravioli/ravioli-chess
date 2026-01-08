from fastapi import APIRouter, Request, Response, status

from app.auth.deps import UserOrAnon
from app.db.session import DbSession

from .schemas import PreferenceUpdate
from .service import update_anon_pref, update_user_pref

router = APIRouter(prefix="/pref", tags=["preference"])


@router.get("")
async def get_pref():
    pass


@router.post("", status_code=status.HTTP_204_NO_CONTENT)
async def update_pref(
    session: DbSession,
    user: UserOrAnon,
    pref: PreferenceUpdate,
    request: Request,
    response: Response,
):
    if user:
        await update_user_pref(session, user, pref)
    else:
        update_anon_pref(request, pref, response)
