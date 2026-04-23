from typing import Annotated

from fastapi import Depends

from app.deps import DbSession, global_env
from ravioli_lib.cache import CacheLib

from .background import Notifier
from .schemas import notification_adapter
from .service import NotifService

cache = CacheLib(
    global_env.redis,
    namespace="notifications",
    data_out=bytes,
    converter=notification_adapter,
    version="v1",
    default_ttl=300,
)


async def create_service(session: DbSession, background: Notifier):
    return NotifService(session, background, cache)


type NotifDeps = Annotated[NotifService, Depends(create_service)]
