from fastapi import Request

from app.auth.deps import UserWithPrefOrAnon
from app.pref.schemas import Preference
from app.pref.service import extract_cookie_data

from .schemas import User


async def inject_user_or_anon(request: Request, user: UserWithPrefOrAnon):
    if user:
        user_to_inject = User.model_validate(user)
        user_to_inject.is_auth = True
    else:
        user_to_inject = User(preference=Preference(**extract_cookie_data(request)), is_auth=False)

    request.state.user = user_to_inject
