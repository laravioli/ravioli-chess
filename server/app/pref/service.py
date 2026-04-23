from datetime import timedelta

import orjson
from fastapi import Request, Response
from itsdangerous import BadSignature, URLSafeSerializer

from app.config import settings
from app.deps import DbSession
from ravioli_service.db.models import User

from .schemas import PreferenceUpdate

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
            cookie_data = cookie_serializer.loads(raw_cookie)
        except BadSignature:
            cookie_data = {}
    return cookie_data


async def update_user_pref(session: DbSession, user: User, pref: PreferenceUpdate):
    payload = pref.model_dump(exclude_unset=True)
    for key, value in payload.items():
        setattr(user.preference, key, value)
    await session.commit()


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
