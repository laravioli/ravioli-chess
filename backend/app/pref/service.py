from datetime import timedelta

from fastapi import Request, Response

from app.api.cookies import cookie_serializer, load_cookie_data
from app.config import settings
from app.user import User
from ravioli_core.db.types import PGConnection

from .repo import PrefRepo
from .schemas import PreferenceUpdate


class PrefService:
    def __init__(self, *, repo: PrefRepo):
        self._repo = repo

    async def update_user_pref(self, conn: PGConnection, user: User, pref: PreferenceUpdate):
        await self._repo.update(conn, user, pref)

    def update_anon_pref(self, request: Request, data: PreferenceUpdate, response: Response):
        new_pref = load_cookie_data(request).update(data)
        payload = cookie_serializer.dumps(new_pref)
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
