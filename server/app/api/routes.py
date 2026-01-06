from fastapi import APIRouter

from app.auth.views import router as router_auth
from app.pref.views import router as router_pref
from app.user.views import router as router_user

router = APIRouter()
router.include_router(router_auth)
router.include_router(router_user)
router.include_router(router_pref)


@router.get("/healthcheck", include_in_schema=False)
def healthcheck():
    return {"status": "ok"}
