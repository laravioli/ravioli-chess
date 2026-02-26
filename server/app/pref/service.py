from datetime import timedelta
from uuid import UUID

from fastapi import Request, Response
from itsdangerous import BadSignature
from sqlalchemy import select, update

from app.config import settings
from app.db.deps import DbSession
from app.exceptions import DBNotFound
from app.serializers.signed import cookie_serializer
from app.user.models import User

from .models import Preference
from .schemas import PreferenceUpdate


async def get_user_pref(session: DbSession, user_id: UUID):
    stmt = select(Preference).where(Preference.user_id == user_id)
    pref = await session.scalar(stmt)
    if not pref:
        raise DBNotFound("could not find user preference")
    return pref


async def update_user_pref(session: DbSession, user: User, pref: PreferenceUpdate):
    payload = pref.model_dump(exclude_unset=True)
    stmt = update(Preference).where(Preference.user_id == user.id).values(payload)
    await session.execute(stmt)
    await session.commit()


def extract_cookie_data(request: Request):
    raw_cookie = request.cookies.get(settings.ANON_COOKIE)
    cookie_data = {}

    if raw_cookie:
        try:
            cookie_data = cookie_serializer.loads(raw_cookie)
        except BadSignature:
            cookie_data = {}
    return cookie_data


def update_anon_pref(request: Request, pref: PreferenceUpdate, response: Response):
    cookie_data = extract_cookie_data(request)
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
