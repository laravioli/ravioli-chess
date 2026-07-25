import logging
from typing import NotRequired, TypedDict

from fastapi import Request
from itsdangerous import BadSignature, URLSafeSerializer

from app.config import settings
from app.pref.structs import Preference
from ravioli_core.db.models.pref import Board, PieceSet
from ravioli_core.serializers import json

logger = logging.getLogger(__name__)


class CookieSerializer:
    def loads(self, payload, /):
        return json.decode(payload, type_arg=Preference)

    def dumps(self, obj, /):
        return json.encode(obj)


cookie_serializer = URLSafeSerializer(
    secret_key=settings.SECRET_KEY.get_secret_value(),
    salt="ravioli.cookie",
    serializer=CookieSerializer(),
)


class CookiePreference(TypedDict):
    board: NotRequired[Board]
    pieceset: NotRequired[PieceSet]


def load_cookie_data(request: Request) -> Preference:
    raw_cookie = request.cookies.get(settings.ANON_COOKIE)

    if raw_cookie:
        try:
            return cookie_serializer.loads(raw_cookie)
        except BadSignature:
            logger.warning("bad signature preference cookie")
            raise
    else:
        return Preference()
