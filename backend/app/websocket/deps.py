from typing import Annotated, TypedDict

from fastapi import Depends
from fastapi.websockets import WebSocket

from app.auth.deps import SessionCookie, get_auth_session
from app.auth.security import verify_session
from app.deps import EnvDep, RedisDep, UserRepoDep
from app.exceptions import InvalidSession

from .schemas import Sri, User


async def user_or_anon(
    env: EnvDep,
    redis: RedisDep,
    user_repo: UserRepoDep,
    session_cookie: SessionCookie = None,
):

    if not session_cookie:
        return

    try:
        session = await get_auth_session(redis, session_cookie)

        async with env.core.engine.connect() as conn:
            user = await user_repo.by_id(conn, session.user_id)

        if not (user and verify_session(user.hashed_password, session.auth_hash)):
            await redis.delete(f"session:{session_cookie}")
            raise InvalidSession()

        return User.model_validate(user)

    except InvalidSession:
        return None


type UserOrAnon = Annotated[User | None, Depends(user_or_anon)]


class WebsocketParams(TypedDict):
    sri: Sri
    user: User | None
    websocket: WebSocket


async def get_websocket_params(
    sri: Sri,
    user: UserOrAnon,
    websocket: WebSocket,
):
    return WebsocketParams(sri=sri, user=user, websocket=websocket)


type WebsocketParamsDep = Annotated[WebsocketParams, Depends(get_websocket_params)]
