import secrets

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncConnection

from app.exceptions import InvalidCredentials
from app.user import User
from app.user.repo import UserRepo
from ravioli_core.serializers import msgpack

from .schemas import Session, UserLogin
from .security import generate_session_hash, verify_password, verify_session


class AuthService:
    def __init__(self, redis: Redis, repo: UserRepo):
        self._redis = redis
        self._user_repo = repo

    async def authenticate(self, conn: AsyncConnection, credentials: UserLogin):
        data = await self._user_repo.by_username_with_pref(conn, credentials.username)
        if data and verify_password(
            credentials.password.get_secret_value(), data.user.hashed_password
        ):
            return data
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

    async def verify_user(self, conn: AsyncConnection, session: Session):
        user = await self._user_repo.by_id(conn, session.user_id)
        if user and verify_session(user.hashed_password, session.auth_hash):
            return user

    async def verify_user_with_pref(self, conn: AsyncConnection, session: Session):
        data = await self._user_repo.by_id_with_pref(conn, session.user_id)
        if data and verify_session(data.user.hashed_password, session.auth_hash):
            return data
