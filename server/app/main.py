from fastapi import FastAPI

from app.api.routes import router as api_router
from app.api.utils import custom_generate_unique_id
from app.exceptions import add_exception_handler
from app.lifespan import lifespan
from app.web.views import router as web_router
from app.websocket.views import router as ws_router
from core.logging import LogSettings, set_logging

set_logging(settings=LogSettings())

app = FastAPI(
    title="Raviolichess API",
    version="0.0.1",
    lifespan=lifespan,
    generate_unique_id_function=custom_generate_unique_id,
)

app.include_router(api_router)
app.include_router(web_router)
app.include_router(ws_router)

add_exception_handler(app)
