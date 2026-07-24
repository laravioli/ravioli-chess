from typing import Annotated

from fastapi import Depends, Request

from app.auth.deps import UserFullOrAnon
from app.deps import EnvDep, PoolConnection
from app.pref.service import load_cookie_data

from .ctx.user import UserCtx


# user context
async def user_ctx(
    request: Request,
    user: UserFullOrAnon,
    env: EnvDep,
    conn: PoolConnection,
):
    if user:
        return UserCtx(
            user=user,
            preference=user.preference,
            unread_count=await env.notif.get_unread_count(conn, user.id),
        )
    else:
        return UserCtx(user=None, preference=load_cookie_data(request))


type UserCtxDep = Annotated[UserCtx, Depends(user_ctx)]
