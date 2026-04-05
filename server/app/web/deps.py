from typing import Annotated

from fastapi import Depends, Request

from app.auth.deps import UserWithPrefOrAnon
from app.deps import RedisClient
from app.pref.service import extract_cookie_data
from lib.cache import CacheService

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
    return CacheService(redis, namespace="web", version="v1", default_ttl=900)


type WebCache = Annotated[CacheService, Depends(get_web_cache)]
