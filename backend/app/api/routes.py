from fastapi import APIRouter, Depends

from app.auth.views import create_auth_api_router
from app.challenge.views import create_challenge_api_router
from app.env import Env
from app.notif.views import create_notif_api_router
from app.pref.views import router as router_pref
from app.social.views import create_social_api_router
from app.user.views import create_user_api_router
from app.web.views_api import create_web_api_router

from .deps import api_response_headers


def create_api_router(env: Env):
    router = APIRouter(prefix="/api", dependencies=[Depends(api_response_headers)])

    router.include_router(create_user_api_router(env))
    router.include_router(create_auth_api_router(env))
    router.include_router(create_challenge_api_router(env))
    router.include_router(create_notif_api_router(env))
    router.include_router(router_pref)
    router.include_router(create_social_api_router(env))
    router.include_router(create_web_api_router(env))

    @router.get("/healthcheck", include_in_schema=False, tags=["internal"])
    def healthcheck():
        return {"status": "ok"}

    return router
