from uuid import UUID

from fastapi_pagination import Params
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.deps import DbSession
from core.db.models import FriendRequest, Friendship, Notification

from .cache import NotifCache


async def db_notifications(session: DbSession, user_id: UUID, params: Params):
    stmt = (
        select(Notification)
        .options(joinedload(FriendRequest.friendship).joinedload(Friendship.sender))
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    )
    return await paginate(session, stmt, params)


async def get_notifications(cache: NotifCache, session: DbSession, user_id: UUID, params: Params):
    return await cache.get_or_set(
        f"{user_id}:{params.page}", factory=lambda: db_notifications(session, user_id, params)
    )
