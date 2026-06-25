import functools
from collections.abc import Awaitable, Callable
from uuid import UUID

from fastapi import BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.publisher import Publisher
from ravioli_core.ipc.w_in import TellUser


class BackgroundNotif:
    def __init__(
        self,
        pub: Publisher,
        session_maker: async_sessionmaker[AsyncSession],
        background_tasks: BackgroundTasks,
    ):
        self.pub = pub
        self.session_maker = session_maker
        self.background_tasks = background_tasks

    def tell_user(
        self,
        user_id: UUID,
        lazy_notif: Callable[[async_sessionmaker[AsyncSession]], Awaitable[TellUser]],
    ):
        self.background_tasks.add_task(
            self.pub.publish_to_online_user,
            str(user_id),
            functools.partial(lazy_notif, self.session_maker),
        )
