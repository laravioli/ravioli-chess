from fastapi import APIRouter

from app.auth.views import router as router_auth
from app.pref.views import router as router_pref
from app.social.views import router as router_social
from app.user.views import router as router_user

router = APIRouter(prefix="/api")
router.include_router(router_auth)
router.include_router(router_user)
router.include_router(router_pref)
router.include_router(router_social)


@router.get("/healthcheck", include_in_schema=False)
def healthcheck():
    return {"status": "ok"}
