from typing import NotRequired, TypedDict

from fastapi import Request
from itsdangerous import BadSignature, URLSafeSerializer

from app.config import settings
from app.pref.structs import Preference
from ravioli_core.db.models.pref import Board, PieceSet
from ravioli_core.serializers import json


class CookieSerializer:
    def loads(self, payload, /):
        return json.decode(payload)

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


def load_cookie_data(request: Request):
    raw_cookie = request.cookies.get(settings.ANON_COOKIE)
    cookie_data = {}

    if raw_cookie:
        try:
            cookie_data: CookiePreference = cookie_serializer.loads(raw_cookie)
        except BadSignature:
            cookie_data = {}
    return Preference(**cookie_data)
