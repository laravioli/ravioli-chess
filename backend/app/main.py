from fastapi import FastAPI
from fastapi_pagination import add_pagination

from app.api.routes import router as api_router
from app.api.utils import custom_generate_unique_id
from app.config import settings
from app.exceptions import add_exception_handler
from app.lifespan import lifespan
from app.middleware import CSRFMiddleWare
from app.web.views import router as web_router
from app.websocket.views import router as ws_router
from ravioli_core.config import LogSettings, configure_logging

configure_logging(settings=LogSettings())

app = FastAPI(
    title="Raviolichess API",
    version="0.0.1",
    lifespan=lifespan,
    generate_unique_id_function=custom_generate_unique_id,
)
app.add_middleware(CSRFMiddleWare)

app.include_router(api_router)
app.include_router(web_router)
app.include_router(ws_router)

if settings.ENABLE_MATCHMAKING:
    from app.matchmaking.views import router as router_matchmaking

    app.include_router(router_matchmaking)

add_pagination(app)
add_exception_handler(app)


# TODO create a small functional wrapper to chain coroutine (those function should just schedule on task, but offer way to combine coroutine like foreach etc)
# TODO add an anon session identifier/ game player id
# TODO implement a challenge api (it is close to friend request), keep it separate from notif like lichess
# TODO define hooks/seek
# TODO define game data model(s)
# TODO implement game ui + websocket + chat + rules
# congrats
