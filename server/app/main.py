from fastapi import FastAPI
from fastapi.responses import ORJSONResponse

from app.api.routes import router as api_router
from app.exceptions import add_exception_handler
from app.lifespan import lifespan

app = FastAPI(
    title="Raviolichess API",
    version="0.0.1",
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
)

app.include_router(api_router)

add_exception_handler(app)


@app.get("/")
async def root():
    return {"message": "Hello Bigger Applications!"}
