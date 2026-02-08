from sqlalchemy import select

from app.db.session import DbSession
from app.user.models import User

from .models import Friendship


async def create_request(session: DbSession, user: User, username: str):
    friend_id = select(User.id).where(User.username == username).scalar_subquery()
    friend_request = Friendship(user_id=user.id, friend_id=friend_id, status="pending")
