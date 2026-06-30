from fastapi import FastAPI

from app.api.utils import custom_generate_unique_id
from app.exceptions import add_exception_handler
from app.matchmaking.views import router as router_matchmaking
from app.middleware import CSRFMiddleWare
from ravioli_core.config import LogSettings, configure_logging

from .lifespan import lifespan

configure_logging(settings=LogSettings())

app = FastAPI(
    title="Raviolichess Matchmaking",
    version="0.0.1",
    lifespan=lifespan,
    generate_unique_id_function=custom_generate_unique_id,
)
app.add_middleware(CSRFMiddleWare)
app.include_router(router_matchmaking)
add_exception_handler(app)
