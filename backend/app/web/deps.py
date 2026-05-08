from fastapi import Request

from app.auth.deps import UserWithPrefOrAnon
from app.pref.service import extract_cookie_data

from .schemas import User


# auth
async def user_or_anon(request: Request, auth_user: UserWithPrefOrAnon):
    if auth_user:
        user = User.model_validate(auth_user)
        user.is_auth = True
    else:
        user = User.anon(extract_cookie_data(request))

    request.state.user = user
