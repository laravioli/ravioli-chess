import os
from environs import env
from environs.exceptions import EnvError
from pathlib import Path

env.read_env()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = env.str("SECRET_KEY")

DEBUG = env.bool("DEBUG", default=False)

# Security
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")
SSL = env.bool("SSL", default=False)
CSRF_COOKIE_SAMESITE = "Strict"
SESSION_COOKIE_SAMESITE = "Strict"
CSRF_COOKIE_HTTPONLY = False
SESSION_COOKIE_HTTPONLY = True

# PROD ONLY
# CSRF_COOKIE_SECURE = True
# SESSION_COOKIE_SECURE = True

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_vite",
    "channels",
    "rest_framework",
    "api",
    "game",
    "lobby",
    "web",
    "websocket",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "web.middleware.CookieMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "raviolichess.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# Web application
ASGI_APPLICATION = "raviolichess.asgi.app"
WSGI_APPLICATION = "raviolichess.wsgi.app"

# Channels config
try:
    REDIS_HOST = ["unix://" + env.str("REDIS_SOCKET_PATH")]
except EnvError:
    REDIS_HOST = [(env.str("REDIS_HOST"), env.str("REDIS_PORT"))]

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": REDIS_HOST,
        },
    },
}

# Database
default_engine = env.str("DB_ENGINE", default="django.db.backends.sqlite3")
DATABASES = {
    "default": {
        "ENGINE": default_engine,
        "NAME": env.str("DB_NAME", default=BASE_DIR / "db.sqlite3"),
    }
}

if default_engine != "django.db.backends.sqlite3":
    DATABASES["default"].update(
        {
            "USER": env.str("DB_USER"),
            "PASSWORD": env.str("DB_PASSWORD"),
            "HOST": env.str("DB_HOST"),
            "PORT": env.str("DB_PORT"),
            "OPTIONS": {
                "pool": True,
            },
        }
    )

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Europe/Paris"

USE_I18N = True

USE_TZ = True

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = "/static/"

STATIC_ROOT = os.path.join(BASE_DIR, "public/static")
MEDIA_ROOT = os.path.join(BASE_DIR, "public/media")

CLIENT_APP_DIR = os.path.abspath(os.path.join(BASE_DIR, "../../client"))

STATICFILES_DIRS = [("web", os.path.join(CLIENT_APP_DIR, "dist"))]

# Django-vite
# https://github.com/MrBin99/django-vite

DJANGO_VITE = {
    "default": {
        "dev_mode": DEBUG,
        "static_url_prefix": "web",
        "manifest_path": os.path.join(CLIENT_APP_DIR, "dist", "manifest.json"),
    }
}


# Django rest framework
# https://www.django-rest-framework.org/

if DEBUG:

    REST_FRAMEWORK = {
        "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
        "PAGE_SIZE": 10,
        "DEFAULT_AUTHENTICATION_CLASSES": [
            "rest_framework.authentication.SessionAuthentication",
        ],
    }
else:
    REST_FRAMEWORK = {
        "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
        "PAGE_SIZE": 10,
        "DEFAULT_AUTHENTICATION_CLASSES": [
            "rest_framework.authentication.SessionAuthentication",
        ],
        "DEFAULT_RENDERER_CLASSES": [
            "rest_framework.renderers.JSONRenderer",
        ],
    }

if DEBUG:
    DATA_UPLOAD_MAX_NUMBER_FIELDS = None
