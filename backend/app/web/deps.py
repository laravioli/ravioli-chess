from typing import Annotated

from fastapi import Depends, Request

from app.auth.deps import UserWithPrefOrAnon
from app.deps import RedisClient
from app.pref.service import extract_cookie_data
from ravioli_core.cache import CacheLib

from .schemas import User


# auth
async def user_or_anon(request: Request, auth_user: UserWithPrefOrAnon):
    if auth_user:
        user = User.model_validate(auth_user)
        user.is_auth = True
    else:
        user = User.anon(extract_cookie_data(request))

    request.state.user = user


# cache
async def get_web_cache(redis: RedisClient):
    return CacheLib(redis, namespace="web", data_out=dict, version="v1", default_ttl=900)


type WebCache = Annotated[CacheLib, Depends(get_web_cache)]
