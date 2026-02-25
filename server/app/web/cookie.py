import orjson
from itsdangerous import URLSafeSerializer

from app.config import settings

cookie_serializer = URLSafeSerializer(
    secret_key=settings.SECRET_KEY.get_secret_value(), salt="ravioli.cookie", serializer=orjson
)
