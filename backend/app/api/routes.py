from fastapi import APIRouter, Depends

from app.auth.views import auth_router
from app.challenge.views import challenge_router
from app.env import Env
from app.notif.views import notif_router
from app.pref.views import pref_router
from app.social.views import social_router
from app.user.views import user_router
from app.web.views_api import web_api_router

from .deps import api_response_headers


def create_api_router(env: Env):
    router = APIRouter(prefix="/api", dependencies=[Depends(api_response_headers)])

    router.include_router(user_router(env))
    router.include_router(auth_router(env))
    router.include_router(challenge_router(env))
    router.include_router(notif_router(env))
    router.include_router(pref_router(env))
    router.include_router(social_router(env))
    router.include_router(web_api_router(env))

    @router.get("/healthcheck", include_in_schema=False, tags=["internal"])
    def healthcheck():
        return {"status": "ok"}

    return router
