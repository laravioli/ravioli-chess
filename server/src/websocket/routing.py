# chat/routing.py
from django.urls import path
from .consumers import GameConsumer

websocket_urlpatterns = [
    path("ws/taxi", GameConsumer.as_asgi()),
]
