from sqlalchemy import update

from app.db.session import DbSession
from app.user.models import User

from .models import Preference
from .schemas import PreferenceUpdate


async def update_user_pref(session: DbSession, user: User, pref: PreferenceUpdate):
    payload = pref.model_dump(exclude_unset=True)
    stmt = update(Preference).where(Preference.user_id == user.id).values(payload)
    await session.execute(stmt)
    await session.commit()


def get_anon_pref():
    pass
