from raviolichess.settings import (
    CHANNEL_LAYERS,
    DATABASES,
    TIME_ZONE,
    USE_TZ,
    USE_I18N,
    DEFAULT_AUTO_FIELD,
    LOGGING,
)

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "channels",
    "user",
    "game",
]
