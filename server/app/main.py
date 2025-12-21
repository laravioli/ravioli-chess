from fastapi import FastAPI

from app.api import router as api_router
from app.lifespan import lifespan

app = FastAPI(lifespan=lifespan)

app.include_router(api_router)


@app.get("/")
async def root():
    return {"message": "Hello Bigger Applications!"}
