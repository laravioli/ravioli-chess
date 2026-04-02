from fastapi import APIRouter

from app.auth.views import router as router_auth
from app.notif.views import router as router_notif
from app.pref.views import router as router_pref
from app.social.views import router as router_social
from app.user.views import router as router_user
from app.web.views_api import router as router_web

router = APIRouter(prefix="/api")
router.include_router(router_auth)
router.include_router(router_user)
router.include_router(router_pref)
router.include_router(router_social)
router.include_router(router_notif)
router.include_router(router_web)


@router.get("/healthcheck", include_in_schema=False, tags=["internal"])
def healthcheck():
    return {"status": "ok"}
