from fastapi import APIRouter, Request, Response, status

from app.api.responses import JSONResponse
from app.auth.deps import UserFullOrAnon, UserOrAnon
from app.deps import PoolConnection
from app.env import Env

from .schemas import PreferenceOut, PreferenceUpdate
from .service import load_cookie_data

router = APIRouter(prefix="/pref", tags=["preferences"])


def pref_router(env: Env):

    @router.get("", response_model=PreferenceOut)
    async def get_pref(user: UserFullOrAnon, request: Request):
        if user:
            pref = user.preference
        else:
            pref = load_cookie_data(request)
        return JSONResponse(pref)

    @router.post("", status_code=status.HTTP_204_NO_CONTENT)
    async def update_pref(
        conn: PoolConnection,
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
