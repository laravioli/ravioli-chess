# chat/routing.py
from django.urls import path
from .consumers import SiteConsumer, PlayConsumer

websocket_urlpatterns = [
    path("socket", SiteConsumer.as_asgi()),
    path("socket/play/<str:game_id>", PlayConsumer.as_asgi()),
]
