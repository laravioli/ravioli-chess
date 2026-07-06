import secrets
from typing import TYPE_CHECKING

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncConnection

from app.exceptions import InvalidCredentials
from app.user import User
from app.user.repo import UserRepo
from ravioli_core.serializers import msgpack

from .schemas import Session, UserLogin
from .security import generate_session_hash, verify_password

if TYPE_CHECKING:
    from .deps import SessionCookie


class AuthService:
    def __init__(self, redis: Redis, repo: UserRepo):
        self._redis = redis
        self._user_repo = repo

    async def authenticate(self, conn: AsyncConnection, credentials: UserLogin):
        user = await self._user_repo.by_username(conn, credentials.username, load_pref=True)
        if user and verify_password(credentials.password.get_secret_value(), user.hashed_password):
            return user
        raise InvalidCredentials()

    async def create_session(
        self,
        user: User,
        expires_in: int,
        session_cookie: "SessionCookie" = None,
    ) -> str:
        if session_cookie:
            await self._redis.delete(f"session:{session_cookie}")

        while True:
            session_id = secrets.token_urlsafe(32)
            session = Session(
                user_id=user.id, auth_hash=generate_session_hash(user.hashed_password)
            )
            ok = await self._redis.set(
                name=f"session:{session_id}",
                value=msgpack.encode(session),
                nx=True,
                ex=expires_in,
            )
            if ok:
                break

        return session_id
