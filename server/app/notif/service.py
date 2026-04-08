from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.deps import DbSession
from core.db.models import FriendRequest, Friendship, Notification

from .cache import NotifCache


async def db_notifications(session: DbSession, user_id: UUID):
    stmt = (
        select(Notification)
        .options(joinedload(FriendRequest.friendship).joinedload(Friendship.sender))
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    )
    result = await session.execute(stmt)
    notifications = result.scalars().all()

    return notifications


async def get_notifications(cache: NotifCache, session: DbSession, user_id: UUID):
    return await cache.get_or_set(f"{user_id}", factory=lambda: db_notifications(session, user_id))
