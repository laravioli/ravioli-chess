from starlette.datastructures import Headers
from starlette.responses import Response
from starlette.types import ASGIApp, Receive, Scope, Send

from app.config import settings


# TODO add X-Requested-with or CSRF token header (piccolo api)
class CSRFMiddleWare:
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:

        if scope["type"] == "http":
            if not (
                scope["method"] in ("GET", "HEAD", "OPTIONS") or isAllowed(Headers(scope=scope))
            ):
                response = Response(status_code=403)
                await response(scope, receive, send)
                return

        elif scope["type"] == "websocket":
            if not isAllowed(Headers(scope=scope)):
                await receive()  # get websocket.connect frame
                await send({"type": "websocket.close", "code": 1008})
                return

        return await self.app(scope, receive, send)


def isAllowed(headers: Headers):
    origin = headers.get("Origin")
    return bool(origin in settings.ALLOWED_HOSTS)
