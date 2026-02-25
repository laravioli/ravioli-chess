from datetime import timedelta

from fastapi import Request, Response
from itsdangerous import BadSignature
from sqlalchemy import update

from app.config import settings
from app.db.deps import DbSession
from app.user.models import User
from app.web.cookie import cookie_serializer

from .models import Preference
from .schemas import PreferenceUpdate


async def update_user_pref(session: DbSession, user: User, pref: PreferenceUpdate):
    payload = pref.model_dump(exclude_unset=True)
    stmt = update(Preference).where(Preference.user_id == user.id).values(payload)
    await session.execute(stmt)
    await session.commit()


def update_anon_pref(request: Request, pref: PreferenceUpdate, response: Response):
    raw_cookie = request.cookies.get(settings.ANON_COOKIE)
    cookie_data = {}

    if raw_cookie:
        try:
            cookie_data = cookie_serializer.loads(raw_cookie)
        except BadSignature:
            cookie_data = {}

    pref_data = pref.model_dump(exclude_unset=True, mode="json")
    new_data = {**cookie_data, **pref_data}

    payload = cookie_serializer.dumps(new_data)
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
