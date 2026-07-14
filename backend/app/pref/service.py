from datetime import timedelta

import orjson
from fastapi import Request, Response
from itsdangerous import BadSignature, URLSafeSerializer
from sqlalchemy.ext.asyncio import AsyncConnection

from app.config import settings
from app.pref.schemas import Preference
from app.user import User

from .repo import PrefRepo
from .schemas import CookiePreference, PreferenceUpdate


class PrefService:
    def __init__(self, *, repo: PrefRepo):
        self._repo = repo

    async def update_user_pref(self, conn: AsyncConnection, user: User, pref: PreferenceUpdate):
        await self._repo.update(conn, user, pref.model_dump(exclude_none=True))

    def update_anon_pref(self, request: Request, data: PreferenceUpdate, response: Response):
        payload = cookie_serializer.dumps(
            extract_cookie_data(request).update(data).model_dump(mode="json")
        )
        if isinstance(payload, bytes):
            payload = payload.decode("utf-8")

        response.set_cookie(
            key=settings.ANON_COOKIE,
            value=payload,
            max_age=int(timedelta(days=7).total_seconds()),
            secure=settings.SSL,
            httponly=True,
            samesite="lax",
        )


cookie_serializer = URLSafeSerializer(
    secret_key=settings.SECRET_KEY.get_secret_value(),
    salt="ravioli.cookie",
    serializer=orjson,
)


def extract_cookie_data(request: Request):
    raw_cookie = request.cookies.get(settings.ANON_COOKIE)
    cookie_data = {}

    if raw_cookie:
        try:
            cookie_data: CookiePreference = cookie_serializer.loads(raw_cookie)
        except BadSignature:
            cookie_data = {}
    return Preference(**cookie_data)
