from fastapi import FastAPI

from app.api.utils import custom_generate_unique_id
from app.exceptions import add_exception_handler
from app.middleware import CSRFMiddleWare
from ravioli_core.logging import LogConfig, configure_logging

from .lifespan import lifespan

configure_logging(conf=LogConfig())

app = FastAPI(
    title="Raviolichess Matchmaking",
    version="0.0.1",
    lifespan=lifespan,
    generate_unique_id_function=custom_generate_unique_id,
)
app.add_middleware(CSRFMiddleWare)
add_exception_handler(app)
