from typing import TYPE_CHECKING

from app.db.base import Base
from app.db.types import PrimaryKey, TimestampNow
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.preference.models import Preference


class User(Base):
    __tablename__ = "user_account"
    id: Mapped[PrimaryKey[int]]
    username: Mapped[str] = mapped_column(String(16), unique=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[bytes]
    is_staff: Mapped[bool] = mapped_column(default=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    joined_at: Mapped[TimestampNow]
    preference: Mapped["Preference"] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
