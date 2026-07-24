from typing import Annotated, TypedDict

from fastapi import Depends
from fastapi.websockets import WebSocket

from app.auth.deps import SessionCookie
from app.auth.security import verify_session_hash
from app.deps import EnvDep, PoolConnection, RedisDep, UserRepoDep
from app.exceptions import InvalidSession

from .schemas import Sri, User


async def user_or_anon(
    env: EnvDep,
    conn: PoolConnection,
    redis: RedisDep,
    user_repo: UserRepoDep,
    session_cookie: SessionCookie = None,
):

    if not session_cookie:
        return

    try:
        session = await env.auth._get_session(session_cookie)
        user = await user_repo.by_id(conn, session.user_id)

        if not (user and verify_session_hash(user.hashed_password, session.auth_hash)):
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
