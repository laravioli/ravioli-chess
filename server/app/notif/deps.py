from typing import Annotated

from fastapi import Depends

from app.deps import DbSession

from .background import Notifier
from .cache import NotifCache
from .service import NotifService


async def create_service(session: DbSession, cache: NotifCache, background: Notifier):
    return NotifService(session, cache, background)


type NotifDeps = Annotated[NotifService, Depends(create_service)]
