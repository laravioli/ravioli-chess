import secrets
from collections.abc import Awaitable, Callable
from uuid import UUID

from redis.asyncio import Redis

from app.exceptions import InvalidCredentials, InvalidSession
from app.user import User
from app.user.repo import UserRepo
from ravioli_core.db.types import PGConnection
from ravioli_core.serializers import msgpack

from .schemas import UserLogin
from .security import generate_session_hash, verify_password, verify_session_hash
from .structs import Session, VerifiableUser

type UserGetter[T] = Callable[[PGConnection, UUID], Awaitable[T | None]]


class AuthService:
    def __init__(self, redis: Redis, repo: UserRepo):
        self._redis = redis
        self._user_repo = repo

    async def authenticate(self, conn: PGConnection, credentials: UserLogin):
        user = await self._user_repo.by_username_full(conn, credentials.username)
        if user and verify_password(credentials.password.get_secret_value(), user.hashed_password):
            return user
        raise InvalidCredentials()

    async def create_session(
        self,
        user: User,
        expires_in: int,
        session_cookie: str | None = None,
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

    async def verify_user_flow[T: VerifiableUser](
        self,
        conn: PGConnection,
        session_id: str,
        user_getter: UserGetter[T],
    ):
        """
        Return a Verified User or Raise InvalidSession
        """
        session = await self._get_session(session_id)
        user = await user_getter(conn, session.user_id)

        if not (user and verify_session_hash(user.hashed_password, session.auth_hash)):
            await self._redis.delete(f"session:{session_id}")
            raise InvalidSession()

        return user

    async def _get_session(self, session_id: str):
        session = await self._redis.get(f"session:{session_id}")
        if session is None:
            raise InvalidSession()
        return Session.decode(session)
