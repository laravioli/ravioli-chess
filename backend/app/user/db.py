from sqlalchemy import bindparam, select
from sqlalchemy.orm import joinedload

from ravioli_core.db.models import User


def select_user(include_preference=False):
    stmt = select(User).where(User.id == bindparam("user_id"))
    if include_preference:
        stmt = stmt.options(joinedload(User.preference))
    return stmt
