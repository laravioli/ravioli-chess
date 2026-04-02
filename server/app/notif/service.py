from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.deps import DbSession
from core.db.models import FriendRequest, Friendship, Notification


async def get_notifications(session: DbSession, user_id: UUID):
    stmt = (
        select(Notification)
        .options(selectinload(FriendRequest.friendship).joinedload(Friendship.sender))
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    )
    result = await session.execute(stmt)
    notifications = result.scalars().all()

    return notifications
