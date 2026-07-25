from collections.abc import Awaitable, Callable
from uuid import UUID

from fastapi import BackgroundTasks

from ravioli_core.ipc.w_in import TellUser
from ravioli_core.pubsub.publisher import Publisher


class Background:
    def __init__(
        self,
        pub: Publisher,
        background_tasks: BackgroundTasks,
    ):
        self.pub = pub
        self.background_tasks = background_tasks

    def tell_user(
        self,
        user_id: UUID,
        lazy_notif: Callable[[], Awaitable[TellUser]],
    ):
        self.background_tasks.add_task(
            self.pub.publish_to_online_user,
            str(user_id),
            lazy_notif,
        )
