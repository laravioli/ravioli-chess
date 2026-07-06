from fastapi import FastAPI
from fastapi_pagination import add_pagination

from app.api.routes import create_api_router
from app.web.views import create_web_router
from app.websocket.views import create_ws_router

from .env import Env


def add_routes(app: FastAPI, env: Env):

    app.include_router(create_api_router(env))
    app.include_router(create_web_router(env))
    app.include_router(create_ws_router(env))

    add_pagination(app)
