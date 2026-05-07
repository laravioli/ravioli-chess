from typing import Annotated

from fastapi import Depends

from app.deps import GLOBAL_ENV, DbSession
from ravioli_core.cache import CacheLib

from .background import Notifier
from .service import NotifService

cache = CacheLib(
    redis=GLOBAL_ENV.redis,
    namespace="notifications",
    version="v1",
    default_ttl=300,
    data_type=int,
)


async def create_service(session: DbSession, background: Notifier):
    return NotifService(session, background, cache)


type NotifDeps = Annotated[NotifService, Depends(create_service)]
