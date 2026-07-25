import uuid

from sqlalchemy import String, false, func, true
from sqlalchemy.orm import Mapped, mapped_column

from ravioli_core.db.types import PrimaryKey, TimestampNow

from .base import Base


class User(Base):
    __tablename__ = "user_account"
    id: Mapped[PrimaryKey[uuid.UUID]] = mapped_column(server_default=func.gen_random_uuid())
    username: Mapped[str] = mapped_column(String(16), unique=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    hashed_password: Mapped[bytes]
    is_staff: Mapped[bool] = mapped_column(server_default=false())
    is_active: Mapped[bool] = mapped_column(server_default=true())
    joined_at: Mapped[TimestampNow]
