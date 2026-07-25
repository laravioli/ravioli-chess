from fastapi import FastAPI

from app.api.utils import custom_generate_unique_id
from app.exceptions import add_exception_handler
from app.lifespan import lifespan
from app.middleware import CSRFMiddleWare
from ravioli_core.logging import LogConfig, configure_logging

configure_logging(conf=LogConfig())

app = FastAPI(
    title="Raviolichess API",
    version="0.0.1",
    lifespan=lifespan,
    generate_unique_id_function=custom_generate_unique_id,
)
app.add_middleware(CSRFMiddleWare)
add_exception_handler(app)

# TODO create a small functional wrapper to chain coroutine (those function should just schedule on task, but offer way to combine coroutine like foreach etc)
# TODO add an anon session identifier/ game player id
# TODO implement a challenge api (it is close to friend request), keep it separate from notif like lichess
# TODO define hooks/seek
# TODO define game data model(s)
# TODO implement game ui + websocket + chat + rules
# congrats
