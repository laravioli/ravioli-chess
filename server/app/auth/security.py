import hashlib
import hmac

from itsdangerous import Signer
from pwdlib import PasswordHash

from app.core.config import settings

password_hash = PasswordHash.recommended()
signer = Signer(
    secret_key=settings.SECRET_KEY,
    salt="ravioli.session_auth_hash",
    key_derivation="hmac",
    digest_method=hashlib.sha256,
)


def get_password_hash(password: str) -> bytes:
    return password_hash.hash(password).encode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def generate_session_hash(hashed_password: bytes) -> bytes:
    if not hashed_password:
        raise ValueError("Cannot generate auth hash for empty password")
    return signer.derive_key(secret_key=hashed_password)


def verify_session(hashed_password: bytes, session_auth_hash: bytes) -> bool:
    expected_hash = generate_session_hash(hashed_password)
    return hmac.compare_digest(expected_hash, session_auth_hash)
