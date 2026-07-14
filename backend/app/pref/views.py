from fastapi import APIRouter, Request, Response, status

from app.auth.deps import UserOrAnon, UserWithPrefOrAnon
from app.deps import DbConnection
from app.env import Env

from .schemas import Preference, PreferenceUpdate
from .service import extract_cookie_data

router = APIRouter(prefix="/pref", tags=["preferences"])


def create_pref_api_router(env: Env):

    @router.get("", response_model=Preference)
    async def get_pref(user: UserWithPrefOrAnon, request: Request):
        if user:
            return user.preference
        else:
            return extract_cookie_data(request)

    @router.post("", status_code=status.HTTP_204_NO_CONTENT)
    async def update_pref(
        conn: DbConnection,
        user: UserOrAnon,
        pref: PreferenceUpdate,
        request: Request,
        response: Response,
    ):
        if user:
            await env.pref.update_user_pref(conn, user, pref)
        else:
            env.pref.update_anon_pref(request, pref, response)

    return router
