from fastapi import FastAPI

from app.api.routes import router as api_router
from app.api.utils import custom_generate_unique_id
from app.exceptions import add_exception_handler
from app.lifespan import lifespan
from app.web.views import router as web_router
from app.websocket.views import router as ws_router
from core.config import LogSettings, configure_logging

configure_logging(settings=LogSettings())

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

# todo
# add http middleware (like cors to secure websocket, cache control etc)
# fix client -> profile page client cache invalidation (avoid trigger a new profile request)
# add client notification ui and client websocket notifications code
# add a read attribute on notification model and implement ui
# add Paginification
# rewrite websocket a bit (specially user integration)
# add an anon session identifier
# implement a challenge api (it is close to friend request), keep it separate from notif like lichess
# define game data model(s)
# implement game ui + websocket
