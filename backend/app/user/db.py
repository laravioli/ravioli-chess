from sqlalchemy import bindparam, select
from sqlalchemy.orm import joinedload

from ravioli_core.db.models import User


class UserRepo:
    select_by_id = select(User.id, User.username, User.hashed_password).where(
        User.id == bindparam("user_id")
    )
    select_by_id_with_pref = select_by_id.options(joinedload(User.preference))


def select_user(include_preference=False):
    stmt = select(User.id, User.username, User.hashed_password).where(
        User.id == bindparam("user_id")
    )
    if include_preference:
        stmt = stmt.options(joinedload(User.preference))
    return stmt
