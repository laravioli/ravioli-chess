from datetime import timedelta
from urllib.parse import parse_qsl, urlencode

from fastapi import Request, Response
from sqlalchemy import update

from app.config import settings
from app.db.deps import DbSession
from app.user.models import User
from app.web.cookie import signer

from .models import Preference
from .schemas import PreferenceUpdate


async def update_user_pref(session: DbSession, user: User, pref: PreferenceUpdate):
    payload = pref.model_dump(exclude_unset=True)
    stmt = update(Preference).where(Preference.user_id == user.id).values(payload)
    await session.execute(stmt)
    await session.commit()


def update_anon_pref(request: Request, pref: PreferenceUpdate, response: Response):
    cookie_data = request.cookies.get(settings.ANON_COOKIE, {})
    if cookie_data:
        cookie_data = signer.unsign(cookie_data).decode()
        cookie_data = dict(parse_qsl(cookie_data))
    pref_data = pref.model_dump(exclude_unset=True, mode="json")
    query_string = urlencode(cookie_data | pref_data)

    response.set_cookie(
        key=settings.ANON_COOKIE,
        value=signer.sign(query_string).decode(),
        max_age=int(timedelta(days=7).total_seconds()),
        secure=settings.SSL,
        httponly=True,
        samesite="lax",
    )
