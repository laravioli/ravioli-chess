from fastapi import APIRouter

from app.testdata.views import router as test_router

router = APIRouter()
router.include_router(test_router)


@router.get("/healthcheck", include_in_schema=False)
def healthcheck():
    return {"status": "ok"}
