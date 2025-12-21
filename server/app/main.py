from fastapi import FastAPI

from app.testdata.views import router as router_test

app = FastAPI()

app.include_router(router_test)


@app.get("/")
async def root():
    return {"message": "Hello Bigger Applications!"}
