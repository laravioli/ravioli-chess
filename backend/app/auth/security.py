import hashlib
import hmac
from typing import TYPE_CHECKING

from itsdangerous import Signer
from pwdlib import PasswordHash
from sqlalchemy.ext.asyncio import AsyncConnection

from app.config import settings

from .schemas import Session

if TYPE_CHECKING:
    from app.user.repo import UserRepo

password_hash = PasswordHash.recommended()

auth_signer = Signer(
    secret_key=settings.SECRET_KEY.get_secret_value(),
    salt="ravioli.session_auth_hash",
    key_derivation="hmac",
    digest_method=hashlib.sha256,
)


def generate_password_hash(password: str) -> bytes:
    return password_hash.hash(password).encode()


def verify_password(plain_password: str, hashed_password: bytes) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def generate_session_hash(hashed_password: bytes) -> bytes:
    return auth_signer.derive_key(secret_key=hashed_password)


def verify_session(hashed_password: bytes, session_auth_hash: bytes) -> bool:
    expected_hash = generate_session_hash(hashed_password)
    return hmac.compare_digest(expected_hash, session_auth_hash)


async def verify_user(repo: "UserRepo", conn: AsyncConnection, session: Session):
    user = await repo.by_id(conn, session.user_id)
    if user and verify_session(user.hashed_password, session.auth_hash):
        return user


async def verify_user_with_pref(repo: "UserRepo", conn: AsyncConnection, session: Session):
    data = await repo.by_id_with_pref(conn, session.user_id)
    if data and verify_session(data.user.hashed_password, session.auth_hash):
        return data
