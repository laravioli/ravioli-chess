from fastapi import APIRouter, Request, Response, status

from app.auth.deps import UserWithPrefOrAnon
from app.db.deps import DbSession

from .schemas import Preference, PreferenceUpdate
from .service import extract_cookie_data, update_anon_pref, update_user_pref

router = APIRouter(prefix="/pref", tags=["preference"])


@router.get("", response_model=Preference)
async def get_pref(user: UserWithPrefOrAnon, request: Request):
    if user:
        return user.preference
    else:
        return extract_cookie_data(request)


@router.post("", status_code=status.HTTP_204_NO_CONTENT)
async def update_pref(
    session: DbSession,
    user: UserWithPrefOrAnon,
    pref: PreferenceUpdate,
    request: Request,
    response: Response,
):
    if user:
        await update_user_pref(session, user, pref)
    else:
        update_anon_pref(request, pref, response)
