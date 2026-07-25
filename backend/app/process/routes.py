from fastapi import FastAPI

from .env import Env
from .matchmaking.views import create_mm_api_router


def add_routes(app: FastAPI, env: Env):
    app.include_router(create_mm_api_router(env))
