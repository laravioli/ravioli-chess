from fastapi import Request

from app.auth.deps import UserWithPrefOrAnon
from app.pref.schemas import Preference
from app.pref.service import extract_cookie_data

from .schemas import User


async def user_or_anon(request: Request, auth_user: UserWithPrefOrAnon):
    if auth_user:
        user = User.model_validate(auth_user)
        user.is_auth = True
    else:
        user = User(preference=Preference(**extract_cookie_data(request)), is_auth=False)

    request.state.user = user
