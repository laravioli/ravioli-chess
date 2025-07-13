"""
ASGI config for raviolichess project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from raviolichess import settings

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from .lifespan import lifespan_app

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "raviolichess.settings")
# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.

if settings.DEBUG:
    http_protocol = {'http': get_asgi_application()}
else:
    import django
    django.setup(set_prefix=False)
    http_protocol = {}

from websocket.routing import websocket_urlpatterns


app = ProtocolTypeRouter(
    http_protocol |
    {
        "lifespan" : lifespan_app,
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
        ),
    }
)

