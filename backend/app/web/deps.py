from typing import Annotated

from fastapi import Depends, Request

from app.auth.deps import UserFullOrAnon
from app.deps import DBConnection, EnvDep
from app.pref.service import load_cookie_data

from .ctx.user import UserCtx


# user context
async def user_ctx(
    request: Request,
    user: UserFullOrAnon,
    env: EnvDep,
    conn: DBConnection,
):
    if user:
        return UserCtx(
            user=user,
            preference=user.preference,
            unread_count=await env.notif.get_unread_count(conn, user.id),
        )
    else:
        _user = UserCtx(user=None, preference=load_cookie_data(request))
        return _user


type UserCtxDep = Annotated[UserCtx, Depends(user_ctx)]
