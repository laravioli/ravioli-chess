from typing import Annotated

from fastapi import Depends, Request

from app.auth.deps import UserWithPrefOrAnon
from app.deps import DbConnection, EnvDep
from app.pref.service import extract_cookie_data

from .ctx.user import UserCtx


# user context
async def user_ctx(
    request: Request,
    data: UserWithPrefOrAnon,
    env: EnvDep,
    conn: DbConnection,
):
    if data:
        return UserCtx(
            user=data.user,
            preference=data.preference,
            unread_count=await env.notif.get_unread_count(conn, data.user.id),
        )
    else:
        return UserCtx(user=None, preference=extract_cookie_data(request))


type UserCtxDep = Annotated[UserCtx, Depends(user_ctx)]
