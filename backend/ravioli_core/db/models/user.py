import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from ravioli_core.db.types import PrimaryKey, TimestampNow

from .base import Base


class User(Base):
    __tablename__ = "user_account"
    id: Mapped[PrimaryKey[uuid.UUID]] = mapped_column(default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(16), unique=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    hashed_password: Mapped[bytes]
    is_staff: Mapped[bool] = mapped_column(default=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    joined_at: Mapped[TimestampNow]
